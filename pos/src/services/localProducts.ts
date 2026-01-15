import { localDB } from "@/db/local";
import { LocalProduct } from "@/db/local/types";

export async function getLocalProducts() {
  return localDB.products.toArray();
}

export async function upsertLocalProduct(product: LocalProduct) {
  await localDB.products.put(product);
}

export async function clearLocalProducts() {
  await localDB.products.clear();
}
