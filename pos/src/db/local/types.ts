export type LocalProduct = {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};
export type LocalOrder = {
  id: string;
  total: number;
  paymentMethod: "cash" | "card" | "mobile";
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type LocalOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
};
