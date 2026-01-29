"use client";

import { useState } from "react";
import { ProductInput } from "@/services/products";

type Props = {
  initialData?: ProductInput;
  onSubmit: (data: ProductInput) => Promise<void>;
  onClose: () => void;
};

type FormErrors = Partial<Record<keyof ProductInput, string>>;

export default function ProductForm({
  initialData,
  onSubmit,
  onClose,
}: Props) {
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!form.sku.trim()) {
      newErrors.sku = "SKU is required";
    } else if (form.sku.trim().length > 50) {
      newErrors.sku = "SKU must be less than 50 characters";
    }

    if (!form.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (form.name.trim().length > 100) {
      newErrors.name = "Product name must be less than 100 characters";
    }

    if (form.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (form.cost < 0) {
      newErrors.cost = "Cost cannot be negative";
    }

    if (form.price < form.cost) {
      newErrors.price = "Price must be greater than or equal to cost";
    }

    if (form.stock < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const margin = form.cost > 0 ? (((form.price - form.cost) / form.cost) * 100).toFixed(1) : "0";
  const profit = (form.price - form.cost).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="product-form space-y-6 p-6 bg-white">
      <div className="form-header mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? "Edit Product" : "Add New Product"}
        </h2>
      </div>

      {/* SKU and Name Row */}
      <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            SKU *
          </label>
          <input
            type="text"
            className={`form-input w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.sku
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter unique SKU"
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.sku && (
            <p className="text-red-600 text-sm mt-1 font-medium">{errors.sku}</p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            className={`form-input w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter product name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1 font-medium">{errors.name}</p>
          )}
        </div>
      </div>

      {/* Price and Cost Row */}
      <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Selling Price ($) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`form-input w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.price
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="0.00"
            value={form.price}
            onChange={(e) => update("price", Number(e.target.value))}
            disabled={isSubmitting}
          />
          {errors.price && (
            <p className="text-red-600 text-sm mt-1 font-medium">{errors.price}</p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cost ($) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`form-input w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.cost
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="0.00"
            value={form.cost}
            onChange={(e) => update("cost", Number(e.target.value))}
            disabled={isSubmitting}
          />
          {errors.cost && (
            <p className="text-red-600 text-sm mt-1 font-medium">{errors.cost}</p>
          )}
        </div>
      </div>

      {/* Profit and Margin Display */}
      <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="profit-display">
          <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
            Profit Per Unit
          </p>
          <p className="text-2xl font-bold text-blue-600">${profit}</p>
        </div>
        <div className="margin-display">
          <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
            Profit Margin
          </p>
          <p className="text-2xl font-bold text-blue-600">{margin}%</p>
        </div>
      </div>

      {/* Stock */}
      <div className="form-group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Initial Stock *
        </label>
        <input
          type="number"
          min="0"
          className={`form-input w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            errors.stock
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          placeholder="0"
          value={form.stock}
          onChange={(e) => update("stock", Number(e.target.value))}
          disabled={isSubmitting}
        />
        {errors.stock && (
          <p className="text-red-600 text-sm mt-1 font-medium">{errors.stock}</p>
        )}
      </div>

      {/* Active Status */}
      <div className="form-group">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            disabled={isSubmitting}
            className="w-5 h-5 text-blue-600 border border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-sm font-semibold text-gray-700">
            Product is Active
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-8">
          Inactive products won't appear in sales
        </p>
      </div>

      {/* Action Buttons */}
      <div className="form-actions flex gap-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="save-btn flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="cancel-btn flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
