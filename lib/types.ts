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

export type PaymentStatus = "Unpaid" | "Paid" | "Failed";
export type PaymentMode = "Cash" | "Online" | null;

export interface Category {
  id: string;
  name: string;
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
