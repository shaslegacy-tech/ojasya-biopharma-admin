// types.ts
export type OrderStatus = "pending" | "accepted" | "delivered";

export interface IOrderProduct {
  productId: IProduct;
  quantity: number;
  price: number;
}

export interface IOrder {
  _id: string;
  hospitalId: IUser;
  supplierId: IUser;
  products: IOrderProduct[];
  status: OrderStatus;
  totalPrice: number;
  prescriptionFileUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: "admin" | "hospital" | "supplier" | "mr";
}

export interface IProduct {
  _id: string;
  name: string;
  category: string;
  description?: string;
  brand?: string;
  price: number;
  unit: string;
  images: string[];
  supplierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInventory {
  _id: string;
  productId: IProduct;
  supplierId: IUser;
  hospitalId?: IUser;
  stock: number;
  price: number;
  threshold: number;
}

export interface IProductOrder {
  productId: IProduct;
  quantity: number;
}