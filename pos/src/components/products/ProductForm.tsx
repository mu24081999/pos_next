"use client";

import { useState } from "react";
import { ProductInput } from "@/services/products";

type Props = {
  initialData?: ProductInput;
  onSubmit: (data: ProductInput) => Promise<void>;
  onClose: () => void;
};

export default function ProductForm({ initialData, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<ProductInput>(
    initialData ?? {
      sku: "",
      name: "",
      price: 0,
      cost: 0,
      stock: 0,
      isActive: true,
    }
  );

  function update<K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input
        className="input"
        placeholder="SKU"
        value={form.sku}
        onChange={(e) => update("sku", e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Name"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        required
      />
      <input
        type="number"
        className="input"
        placeholder="Price"
        value={form.price}
        onChange={(e) => update("price", Number(e.target.value))}
      />
      <input
        type="number"
        className="input"
        placeholder="Cost"
        value={form.cost}
        onChange={(e) => update("cost", Number(e.target.value))}
      />
      <input
        type="number"
        className="input"
        placeholder="Stock"
        value={form.stock}
        onChange={(e) => update("stock", Number(e.target.value))}
      />

      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => update("isActive", e.target.checked)}
        />
        Active
      </label>

      <div className="flex gap-2">
        <button className="btn-primary" type="submit">
          Save
        </button>
        <button className="btn-secondary" type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
