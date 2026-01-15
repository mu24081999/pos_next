import Dexie, { Table } from "dexie";
import { LocalProduct, LocalOrder, LocalOrderItem } from "./types";
export class PosLocalDB extends Dexie {
  products!: Table<LocalProduct, string>;
  orders!: Table<LocalOrder, string>;
  orderItems!: Table<LocalOrderItem, string>;

  constructor() {
    super("pos-local-db");
    this.version(1).stores({
      products: "id, sku, name, price, stock, category, createdAt, updatedAt",
      orders: "id, total, paymentMethod, synced, createdAt, updatedAt",
      orderItems: "id, orderId, productId, quantity, price",
    });
  }
}
