"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category,
  BusinessCategory,
  Zone,
  Shop,
  Followup,
  Product,
  Salesman,
  Deliveryman,
  Order,
  QRConfig,
  CurrentUser,
  OrderStatus,
  PaymentMode,
  PaymentSplit,
} from "./types";

export const ADMIN_CREDENTIALS = { loginId: "admin", password: "Harsh@3321" };

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
  businessCategories: BusinessCategory[];
  zones: Zone[];
  shops: Shop[];
  followups: Followup[];
  products: Product[];
  salesmen: Salesman[];
  deliverymen: Deliveryman[];
  orders: Order[];
  qr: QRConfig;
  adminPassword: string;

  bootstrap: () => Promise<void>;

  login: (loginId: string, password: string) => CurrentUser | null;
  setCurrentUser: (u: CurrentUser | null) => void;
  logout: () => void;

  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;

  addBusinessCategory: (name: string) => void;
  deleteBusinessCategory: (id: string) => void;

  addZone: (name: string) => void;
  deleteZone: (id: string) => void;
  addAreaToZone: (zoneId: string, area: string) => void;
  removeAreaFromZone: (zoneId: string, area: string) => void;

  addShop: (s: Omit<Shop, "id" | "createdAt">) => Shop;
  updateShop: (id: string, s: Partial<Shop>) => void;
  deleteShop: (id: string) => void;

  addFollowup: (f: Omit<Followup, "id" | "createdAt" | "status">) => void;
  markFollowupDone: (id: string) => void;
  deleteFollowup: (id: string) => void;

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
      split?: PaymentSplit;
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

/** Does a deliveryman cover the given order zone? Handles the new `zones`
 *  array plus the legacy `area` text ("All Zone" / a zone name). */
export function deliverymanCoversZone(
  d: Deliveryman,
  orderZone: string | undefined,
  zones: Zone[]
): boolean {
  const dz = Array.isArray(d.zones) ? d.zones : [];
  if (dz.includes("all")) return true;
  const zoneId = orderZone ? zones.find((z) => z.name === orderZone)?.id : undefined;
  if (zoneId && dz.includes(zoneId)) return true;
  const area = (d.area || "").trim().toLowerCase();
  if (area === "all" || area === "all zone" || area === "all zones") return true;
  if (orderZone && d.area && d.area.trim().toLowerCase() === orderZone.trim().toLowerCase())
    return true;
  return false;
}

/** Fill safe defaults so partial/hand-edited orders never crash the UI. */
function normalizeOrder(o: any): Order {
  return {
    orderNo: o?.id ?? "ORD-?",
    createdAt: new Date().toISOString(),
    shopName: "Unknown Shop",
    shopContactName: "",
    shopMobile: "",
    shopPhoto: "",
    salesmanId: "",
    salesmanName: "",
    deliverymanId: "",
    deliverymanName: "",
    status: "Pending Admin Review",
    paymentStatus: "Unpaid",
    paymentMode: null,
    ...o,
    items: Array.isArray(o?.items) ? o.items : [],
    history: Array.isArray(o?.history) ? o.history : [],
    totalAmount: Number(o?.totalAmount) || 0,
    location: o?.location ?? { latitude: null, longitude: null, address: "", mapsLink: "" },
    id: o?.id,
  } as Order;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      bootstrapStarted: false,
      bootstrapError: false,
      currentUser: null,

      categories: [],
      businessCategories: [],
      zones: [],
      shops: [],
      followups: [],
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
            businessCategories: d.businessCategories ?? [],
            zones: d.zones ?? [],
            shops: d.shops ?? [],
            followups: d.followups ?? [],
            products: d.products ?? [],
            salesmen: d.salesmen ?? [],
            deliverymen: d.deliverymen ?? [],
            orders: (d.orders ?? []).map(normalizeOrder),
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

      setCurrentUser: (u) => set({ currentUser: u }),

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

      // ---- business categories (shop types) ----
      addBusinessCategory: (name) => {
        const bc: BusinessCategory = { id: uid("bcat"), name: name.trim(), createdAt: new Date().toISOString() };
        set((s) => ({ businessCategories: [...s.businessCategories, bc] }));
        persistOp("businessCategories", "insert", bc);
      },
      deleteBusinessCategory: (id) => {
        set((s) => ({ businessCategories: s.businessCategories.filter((c) => c.id !== id) }));
        persistOp("businessCategories", "delete", { id });
      },

      // ---- zones & areas ----
      addZone: (name) => {
        const z: Zone = { id: uid("zone"), name: name.trim(), areas: [], createdAt: new Date().toISOString() };
        set((s) => ({ zones: [...s.zones, z] }));
        persistOp("zones", "insert", z);
      },
      deleteZone: (id) => {
        set((s) => ({ zones: s.zones.filter((z) => z.id !== id) }));
        persistOp("zones", "delete", { id });
      },
      addAreaToZone: (zoneId, area) => {
        const a = area.trim();
        if (!a) return;
        const zone = get().zones.find((z) => z.id === zoneId);
        if (!zone || zone.areas.includes(a)) return;
        const patch = { areas: [...zone.areas, a] };
        set((s) => ({ zones: s.zones.map((z) => (z.id === zoneId ? { ...z, ...patch } : z)) }));
        persistOp("zones", "update", { id: zoneId, patch });
      },
      removeAreaFromZone: (zoneId, area) => {
        const zone = get().zones.find((z) => z.id === zoneId);
        if (!zone) return;
        const patch = { areas: zone.areas.filter((x) => x !== area) };
        set((s) => ({ zones: s.zones.map((z) => (z.id === zoneId ? { ...z, ...patch } : z)) }));
        persistOp("zones", "update", { id: zoneId, patch });
      },

      // ---- shops ----
      addShop: (shop) => {
        const record: Shop = { ...shop, id: uid("shop"), createdAt: new Date().toISOString() };
        set((s) => ({ shops: [record, ...s.shops] }));
        persistOp("shops", "insert", record);
        return record;
      },
      updateShop: (id, patch) => {
        set((s) => ({ shops: s.shops.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
        persistOp("shops", "update", { id, patch });
      },
      deleteShop: (id) => {
        set((s) => ({ shops: s.shops.filter((x) => x.id !== id) }));
        persistOp("shops", "delete", { id });
      },

      // ---- follow-ups (revisit reminders) ----
      addFollowup: (f) => {
        const record: Followup = {
          ...f,
          id: uid("fu"),
          status: "Pending",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ followups: [record, ...s.followups] }));
        persistOp("followups", "insert", record);
      },
      markFollowupDone: (id) => {
        set((s) => ({
          followups: s.followups.map((x) => (x.id === id ? { ...x, status: "Done" } : x)),
        }));
        persistOp("followups", "update", { id, patch: { status: "Done" } });
      },
      deleteFollowup: (id) => {
        set((s) => ({ followups: s.followups.filter((x) => x.id !== id) }));
        persistOp("followups", "delete", { id });
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
        // Auto-assign a deliveryman whose zone covers this order's zone.
        let deliverymanId = o.deliverymanId;
        let deliverymanName = o.deliverymanName;
        if (!deliverymanId) {
          const dm = get().deliverymen.find(
            (d) => d.status === "Active" && deliverymanCoversZone(d, o.zone, get().zones)
          );
          if (dm) {
            deliverymanId = dm.id;
            deliverymanName = dm.fullName;
          }
        }
        const assigned = !!deliverymanId;
        const order: Order = {
          ...o,
          deliverymanId,
          deliverymanName,
          id: uid("ord"),
          orderNo: `ORD-${1001 + get().orders.length}`,
          createdAt: now,
          status: assigned ? "Deliveryman Assigned" : "Pending Admin Review",
          paymentStatus: "Unpaid",
          paymentMode: null,
          history: [
            { status: "Pending Admin Review", at: now },
            ...(assigned ? [{ status: "Deliveryman Assigned", at: now }] : []),
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
        const order = get().orders.find((o) => o.id === orderId);
        const credit = data.split?.credit ?? 0;
        // If any amount is on credit, the order is only partially paid.
        const paymentStatus = credit > 0 ? "Partial" : "Paid";
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? pushHistory(
                  {
                    ...o,
                    paymentStatus,
                    paymentMode: data.paymentMode,
                    split: data.split,
                    amountReceived: data.amountReceived,
                    transactionId: data.transactionId,
                    paymentScreenshot: data.paymentScreenshot,
                    paymentNote: data.paymentNote,
                    paidAt: new Date().toISOString(),
                    deliveredAt: new Date().toISOString(),
                    status: "Completed",
                  },
                  credit > 0 ? "Delivered (Credit pending)" : "Payment Completed"
                )
              : o
          ),
        }));
        void order;
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
