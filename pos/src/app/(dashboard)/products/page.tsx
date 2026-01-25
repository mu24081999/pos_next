"use client";

import { useEffect, useState } from "react";
import ProductForm from "@/components/products/ProductForm";
import ProductTable from "@/components/products/ProductTable";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/products";
import { syncProducts } from "@/lib/syncProducts";
import { getLocalProducts } from "@/services/localProducts";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    await syncProducts();
    setProducts(await getLocalProducts());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(data: any) {
    await createProduct(data);
    await load();
  }

  async function handleEdit(data: any) {
    await updateProduct(editing.id, data);
    await load();
  }

  async function handleDelete(product: any) {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      await deleteProduct(product.id);
      await load();
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Products</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add Product
        </button>
      </div>

      <ProductTable
        products={products}
        onEdit={(p) => {
          setEditing(p);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />

      {showForm && (
        <div className="modal">
          <ProductForm
            initialData={editing}
            onSubmit={editing ? handleEdit : handleAdd}
            onClose={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
