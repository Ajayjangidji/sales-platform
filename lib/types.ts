export type Role = "admin" | "salesman" | "deliveryman";

export type OrderStatus =
  | "Pending Admin Review"
  | "Deliveryman Assigned"
  | "Accepted by Deliveryman"
  | "Out for Delivery"
  | "Reached at Shop"
  | "Payment Pending"
  | "Delivered"
  | "Completed"
  | "Cancelled"
  | "Delivery Failed";

export type PaymentStatus = "Unpaid" | "Paid" | "Partial" | "Failed";
export type PaymentMode = "Cash" | "Online" | "Credit" | "Split" | null;

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

/** Shop type, e.g. Kirana / Hardware / Clinic / Trading company. */
export interface BusinessCategory {
  id: string;
  name: string;
  createdAt: string;
}

/** A delivery zone containing multiple areas. */
export interface Zone {
  id: string;
  name: string;
  areas: string[];
  createdAt: string;
}

/** A split of a payment across modes. */
export interface PaymentSplit {
  cash: number;
  online: number;
  credit: number;
}

/** A revisit reminder — shopkeeper asked the salesman to come back later. */
export interface Followup {
  id: string;
  shopId?: string;
  shopName: string;
  shopMobile: string;
  zone?: string;
  area?: string;
  salesmanId: string;
  salesmanName: string;
  note: string;
  revisitDate: string; // YYYY-MM-DD
  status: "Pending" | "Done";
  createdAt: string;
}

/** A shop/customer record, unique by mobile number. */
export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  mobile: string;
  photo: string;
  zone: string;
  area: string;
  businessCategoryId: string | null;
  location: ShopLocation;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  photo: string; // emoji or image URL
  categoryId: string | null;
  cartonName: string; // e.g. "Carton", "Box"
  itemsPerCarton: number;
  availableCartons: number;
  pricePerItem: number;
  pricePerCarton: number;
  description: string;
  deliveryLocation: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Salesman {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  photo: string;
  loginId: string;
  password: string;
  area: string;
  /** Zone ids assigned to this salesman, or ["all"] for all zones. */
  zones?: string[];
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Deliveryman {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  photo: string;
  vehicle: string;
  loginId: string;
  password: string;
  area: string;
  /** Zone ids assigned to this deliveryman, or ["all"] for all zones. */
  zones?: string[];
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  cartonName: string;
  itemsPerCarton: number;
  cartons: number;
  pricePerCarton: number;
  lineTotal: number;
}

export interface ShopLocation {
  latitude: number | null;
  longitude: number | null;
  address: string;
  mapsLink: string;
}

export interface Order {
  id: string;
  orderNo: string;
  createdAt: string;
  shopName: string;
  shopContactName: string;
  shopMobile: string;
  shopPhoto: string;
  shopId?: string;
  zone?: string;
  area?: string;
  businessCategoryId?: string | null;
  location: ShopLocation;
  salesmanId: string;
  salesmanName: string;
  deliverymanId: string;
  deliverymanName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  /** Split of the collected amount across Cash / Online / Credit. */
  split?: PaymentSplit;
  amountReceived?: number;
  transactionId?: string;
  paymentScreenshot?: string;
  paymentNote?: string;
  paidAt?: string;
  deliveredAt?: string;
  history: { status: string; at: string }[];
}

export interface QRConfig {
  image: string; // data URL or placeholder
  upiName: string;
  status: "Active" | "Inactive";
}

export interface CurrentUser {
  role: Role;
  id: string;
  name: string;
}
