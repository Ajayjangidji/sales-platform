"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category,
  Product,
  Salesman,
  Deliveryman,
  Order,
  QRConfig,
  CurrentUser,
  OrderStatus,
  PaymentMode,
} from "./types";

export const ADMIN_CREDENTIALS = { loginId: "admin", password: "admin123" };

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Fire-and-forget persistence to Postgres via the mutate API. */
function persistOp(collection: string, op: string, data: any) {
  if (typeof window === "undefined") return;
  fetch("/api/mutate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ collection, op, data }),
  }).catch((e) => console.error("persist failed", collection, op, e));
}

interface AppState {
  hydrated: boolean;
  bootstrapStarted: boolean;
  bootstrapError: boolean;
  currentUser: CurrentUser | null;

  categories: Category[];
  products: Product[];
  salesmen: Salesman[];
  deliverymen: Deliveryman[];
  orders: Order[];
  qr: QRConfig;
  adminPassword: string;

  bootstrap: () => Promise<void>;

  login: (loginId: string, password: string) => CurrentUser | null;
  logout: () => void;

  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;

  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;

  addSalesman: (s: Omit<Salesman, "id" | "createdAt">) => void;
  updateSalesman: (id: string, s: Partial<Salesman>) => void;
  deleteSalesman: (id: string) => void;
  toggleSalesmanStatus: (id: string) => void;
  resetSalesmanPassword: (id: string, pw: string) => void;

  addDeliveryman: (d: Omit<Deliveryman, "id" | "createdAt">) => void;
  updateDeliveryman: (id: string, d: Partial<Deliveryman>) => void;
  deleteDeliveryman: (id: string) => void;
  toggleDeliverymanStatus: (id: string) => void;
  resetDeliverymanPassword: (id: string, pw: string) => void;

  createOrder: (
    o: Omit<
      Order,
      "id" | "orderNo" | "createdAt" | "history" | "status" | "paymentStatus" | "paymentMode"
    >
  ) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  reassignDeliveryman: (orderId: string, deliverymanId: string) => void;
  cancelOrder: (id: string) => void;
  recordPayment: (
    orderId: string,
    data: {
      paymentMode: PaymentMode;
      amountReceived: number;
      transactionId?: string;
      paymentScreenshot?: string;
      paymentNote?: string;
    }
  ) => void;

  updateQR: (q: Partial<QRConfig>) => void;
  changeAdminPassword: (pw: string) => void;
}

function pushHistory(o: Order, status: string): Order {
  return { ...o, history: [...o.history, { status, at: new Date().toISOString() }] };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      bootstrapStarted: false,
      bootstrapError: false,
      currentUser: null,

      categories: [],
      products: [],
      salesmen: [],
      deliverymen: [],
      orders: [],
      qr: { image: "", upiName: "", status: "Inactive" },
      adminPassword: ADMIN_CREDENTIALS.password,

      bootstrap: async () => {
        if (get().bootstrapStarted) return;
        set({ bootstrapStarted: true });
        try {
          const res = await fetch("/api/bootstrap", { cache: "no-store" });
          if (!res.ok) throw new Error("bootstrap status " + res.status);
          const d = await res.json();
          set({
            categories: d.categories ?? [],
            products: d.products ?? [],
            salesmen: d.salesmen ?? [],
            deliverymen: d.deliverymen ?? [],
            orders: d.orders ?? [],
            qr: d.qr ?? { image: "", upiName: "", status: "Inactive" },
            adminPassword: d.admin?.password ?? ADMIN_CREDENTIALS.password,
            hydrated: true,
            bootstrapError: false,
          });
        } catch (e) {
          console.error("bootstrap failed", e);
          set({ hydrated: true, bootstrapError: true });
        }
      },

      login: (loginId, password) => {
        const id = loginId.trim().toLowerCase();
        if (id === ADMIN_CREDENTIALS.loginId && password === get().adminPassword) {
          const user: CurrentUser = { role: "admin", id: "admin", name: "Administrator" };
          set({ currentUser: user });
          return user;
        }
        const sm = get().salesmen.find(
          (s) => s.loginId.toLowerCase() === id && s.password === password
        );
        if (sm) {
          if (sm.status === "Inactive") return null;
          const user: CurrentUser = { role: "salesman", id: sm.id, name: sm.fullName };
          set({ currentUser: user });
          return user;
        }
        const dm = get().deliverymen.find(
          (d) => d.loginId.toLowerCase() === id && d.password === password
        );
        if (dm) {
          if (dm.status === "Inactive") return null;
          const user: CurrentUser = { role: "deliveryman", id: dm.id, name: dm.fullName };
          set({ currentUser: user });
          return user;
        }
        return null;
      },

      logout: () => set({ currentUser: null }),

      // ---- categories ----
      addCategory: (name) => {
        const cat: Category = { id: uid("cat"), name: name.trim(), createdAt: new Date().toISOString() };
        set((s) => ({ categories: [...s.categories, cat] }));
        persistOp("categories", "insert", cat);
      },
      deleteCategory: (id) => {
        const updatedProducts = get().products.map((p) =>
          p.categoryId === id ? { ...p, categoryId: null } : p
        );
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id), products: updatedProducts }));
        persistOp("categories", "delete", { id });
        persistOp("products", "replaceAll", { items: updatedProducts });
      },

      // ---- products ----
      addProduct: (p) => {
        const product: Product = { ...p, id: uid("prod"), createdAt: new Date().toISOString() };
        set((s) => ({ products: [product, ...s.products] }));
        persistOp("products", "insert", product);
      },
      updateProduct: (id, patch) => {
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
        persistOp("products", "update", { id, patch });
      },
      deleteProduct: (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        persistOp("products", "delete", { id });
      },
      toggleProductStatus: (id) => {
        const p = get().products.find((x) => x.id === id);
        if (!p) return;
        const status = p.status === "Active" ? "Inactive" : "Active";
        set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, status } : x)) }));
        persistOp("products", "update", { id, patch: { status } });
      },

      // ---- salesmen ----
      addSalesman: (sm) => {
        const person: Salesman = { ...sm, id: uid("sm"), createdAt: new Date().toISOString() };
        set((s) => ({ salesmen: [person, ...s.salesmen] }));
        persistOp("salesmen", "insert", person);
      },
      updateSalesman: (id, patch) => {
        set((s) => ({ salesmen: s.salesmen.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
        persistOp("salesmen", "update", { id, patch });
      },
      deleteSalesman: (id) => {
        set((s) => ({ salesmen: s.salesmen.filter((x) => x.id !== id) }));
        persistOp("salesmen", "delete", { id });
      },
      toggleSalesmanStatus: (id) => {
        const p = get().salesmen.find((x) => x.id === id);
        if (!p) return;
        const status = p.status === "Active" ? "Inactive" : "Active";
        set((s) => ({ salesmen: s.salesmen.map((x) => (x.id === id ? { ...x, status } : x)) }));
        persistOp("salesmen", "update", { id, patch: { status } });
      },
      resetSalesmanPassword: (id, pw) => {
        set((s) => ({ salesmen: s.salesmen.map((x) => (x.id === id ? { ...x, password: pw } : x)) }));
        persistOp("salesmen", "update", { id, patch: { password: pw } });
      },

      // ---- deliverymen ----
      addDeliveryman: (dm) => {
        const person: Deliveryman = { ...dm, id: uid("dm"), createdAt: new Date().toISOString() };
        set((s) => ({ deliverymen: [person, ...s.deliverymen] }));
        persistOp("deliverymen", "insert", person);
      },
      updateDeliveryman: (id, patch) => {
        set((s) => ({ deliverymen: s.deliverymen.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
        persistOp("deliverymen", "update", { id, patch });
      },
      deleteDeliveryman: (id) => {
        set((s) => ({ deliverymen: s.deliverymen.filter((x) => x.id !== id) }));
        persistOp("deliverymen", "delete", { id });
      },
      toggleDeliverymanStatus: (id) => {
        const p = get().deliverymen.find((x) => x.id === id);
        if (!p) return;
        const status = p.status === "Active" ? "Inactive" : "Active";
        set((s) => ({ deliverymen: s.deliverymen.map((x) => (x.id === id ? { ...x, status } : x)) }));
        persistOp("deliverymen", "update", { id, patch: { status } });
      },
      resetDeliverymanPassword: (id, pw) => {
        set((s) => ({ deliverymen: s.deliverymen.map((x) => (x.id === id ? { ...x, password: pw } : x)) }));
        persistOp("deliverymen", "update", { id, patch: { password: pw } });
      },

      // ---- orders ----
      createOrder: (o) => {
        const now = new Date().toISOString();
        const order: Order = {
          ...o,
          id: uid("ord"),
          orderNo: `ORD-${1001 + get().orders.length}`,
          createdAt: now,
          status: o.deliverymanId ? "Deliveryman Assigned" : "Pending Admin Review",
          paymentStatus: "Unpaid",
          paymentMode: null,
          history: [
            { status: "Pending Admin Review", at: now },
            ...(o.deliverymanId ? [{ status: "Deliveryman Assigned", at: now }] : []),
          ],
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        persistOp("orders", "insert", order);
        return order;
      },
      updateOrderStatus: (id, status) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? pushHistory(
                  {
                    ...o,
                    status,
                    deliveredAt:
                      status === "Delivered" || status === "Completed"
                        ? new Date().toISOString()
                        : o.deliveredAt,
                  },
                  status
                )
              : o
          ),
        }));
        const updated = get().orders.find((o) => o.id === id);
        if (updated) persistOp("orders", "update", { id, patch: updated });
      },
      reassignDeliveryman: (orderId, deliverymanId) => {
        const dm = get().deliverymen.find((d) => d.id === deliverymanId);
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? pushHistory(
                  { ...o, deliverymanId, deliverymanName: dm?.fullName ?? o.deliverymanName },
                  `Reassigned to ${dm?.fullName ?? "deliveryman"}`
                )
              : o
          ),
        }));
        const updated = get().orders.find((o) => o.id === orderId);
        if (updated) persistOp("orders", "update", { id: orderId, patch: updated });
      },
      cancelOrder: (id) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? pushHistory({ ...o, status: "Cancelled" }, "Cancelled") : o
          ),
        }));
        const updated = get().orders.find((o) => o.id === id);
        if (updated) persistOp("orders", "update", { id, patch: updated });
      },
      recordPayment: (orderId, data) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? pushHistory(
                  {
                    ...o,
                    paymentStatus: "Paid",
                    paymentMode: data.paymentMode,
                    amountReceived: data.amountReceived,
                    transactionId: data.transactionId,
                    paymentScreenshot: data.paymentScreenshot,
                    paymentNote: data.paymentNote,
                    paidAt: new Date().toISOString(),
                    deliveredAt: new Date().toISOString(),
                    status: "Completed",
                  },
                  "Payment Completed"
                )
              : o
          ),
        }));
        const updated = get().orders.find((o) => o.id === orderId);
        if (updated) persistOp("orders", "update", { id: orderId, patch: updated });
      },

      // ---- qr ----
      updateQR: (q) => {
        const next = { ...get().qr, ...q };
        set({ qr: next });
        persistOp("qr", "set", next);
      },

      // ---- admin password ----
      changeAdminPassword: (pw) => {
        set({ adminPassword: pw });
        persistOp("admin", "set", { password: pw });
      },
    }),
    {
      name: "sales-app-session",
      // Only the session is kept in the browser; all business data lives in Postgres.
      partialize: (s) => ({ currentUser: s.currentUser }),
    }
  )
);
