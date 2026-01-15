import { upsertLocalProduct } from "@/services/localProducts";

export async function syncProducts() {
  const res = await fetch("/api/products");
  const products = await res.json();

  for (const p of products) {
    await upsertLocalProduct({
      ...p,
      updatedAt: new Date(p.updatedAt).getTime(),
    });
  }
}
