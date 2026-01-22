"use client";

import { useEffect, useState } from "react";
import ProductForm from "@/components/products/ProductForm";
import ProductTable from "@/components/products/ProductTable";
import { createProduct, updateProduct, deleteProduct } from "@/services/products";
import { syncProducts } from "@/lib/syncProducts";
import { getLocalProducts } from "@/services/localProducts";
import {
  printProductLabel,
  printMultipleLabels,
  exportProductsToCSV,
  BarcodeScanner,
  printProductsReport,
} from "@/lib/hardware";

type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  isActive?: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const [barcodeScannerActive, setBarcodeScannerActive] = useState(false);
  const scanner = useRef<BarcodeScanner | null>(null);

  // Filter products based on active status
  useEffect(() => {
    const filtered = showInactive
      ? products
      : products.filter((p) => p.isActive !== false);
    setFilteredProducts(filtered);
  }, [products, showInactive]);

  async function load() {
    setIsLoading(true);
    try {
      await syncProducts();
      const data = await getLocalProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(data: any) {
    try {
      await createProduct(data);
      await load();
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  }

  async function handleEdit(data: any) {
    try {
      if (editing) {
        await updateProduct(editing.id, data);
        await load();
        setShowForm(false);
        setEditing(null);
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  }

  async function handleDelete(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProduct(product.id);
        await load();
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  }

  const handlePrintLabel = (product: Product) => {
    printProductLabel(product, 1);
  };

  const handlePrintMultipleLabels = () => {
    if (filteredProducts.length === 0) {
      alert("No products to print");
      return;
    }
    const copiesEach = prompt("Enter number of copies per product:", "1");
    if (copiesEach && !isNaN(Number(copiesEach))) {
      printMultipleLabels(filteredProducts, Number(copiesEach));
    }
  };

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      alert("No products to export");
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    exportProductsToCSV(filteredProducts, `products_${timestamp}.csv`);
  };

  const handlePrintReport = () => {
    if (filteredProducts.length === 0) {
      alert("No products to print");
      return;
    }
    printProductsReport(filteredProducts);
  };

  const handleActivateScanner = () => {
    if (!barcodeScannerActive) {
      scanner.current = new BarcodeScanner((scannedSku) => {
        const found = products.find(
          (p) => p.sku.toLowerCase() === scannedSku.toLowerCase()
        );
        if (found) {
          setEditing(found);
          setShowForm(true);
          setScannerMessage(`✓ Found: ${found.name}`);
          setTimeout(() => setScannerMessage(""), 2000);
        } else {
          setScannerMessage(`✗ SKU not found: ${scannedSku}`);
          setTimeout(() => setScannerMessage(""), 2000);
        }
      });
      scanner.current.start();
      setBarcodeScannerActive(true);
      setScannerMessage("Scanner active - scan a barcode or SKU");
    } else {
      scanner.current?.stop();
      setBarcodeScannerActive(false);
      setScannerMessage("");
    }
  };

  const totalInventoryValue = filteredProducts.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );
  const totalCostValue = filteredProducts.reduce(
    (sum, p) => sum + p.cost * p.stock,
    0
  );
  const totalProfit = totalInventoryValue - totalCostValue;

  return (
    <div className="products-page bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="page-header bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="header-content">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Products
              </h1>
              <p className="text-gray-600">
                Manage your product inventory and pricing
              </p>
            </div>
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="add-product-btn px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              + Add Product
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="stat-label text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Products
              </p>
              <p className="stat-value text-2xl font-bold text-blue-600">
                {filteredProducts.length}
              </p>
            </div>
            <div className="stat-card bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="stat-label text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Inventory Value
              </p>
              <p className="stat-value text-2xl font-bold text-green-600">
                ${totalInventoryValue.toFixed(2)}
              </p>
            </div>
            <div className="stat-card bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="stat-label text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Cost
              </p>
              <p className="stat-value text-2xl font-bold text-purple-600">
                ${totalCostValue.toFixed(2)}
              </p>
            </div>
            <div className="stat-card bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="stat-label text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Profit
              </p>
              <p className="stat-value text-2xl font-bold text-orange-600">
                ${totalProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="page-content px-6 py-6">
        {/* Toolbar */}
        <div className="toolbar-section bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <div className="toolbar-actions grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <button
              onClick={handlePrintLabel}
              disabled={filteredProducts.length === 0}
              title="Print single product label"
              className="toolbar-action-btn px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              🖨 Print Labels
            </button>
            <button
              onClick={handlePrintReport}
              disabled={filteredProducts.length === 0}
              title="Print full inventory report"
              className="toolbar-action-btn px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              📊 Print Report
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredProducts.length === 0}
              title="Export products to CSV"
              className="toolbar-action-btn px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ↓ Export CSV
            </button>
            <button
              onClick={handleActivateScanner}
              title="Enable barcode scanner"
              className={`toolbar-action-btn px-4 py-2 font-medium rounded-lg transition ${
                barcodeScannerActive
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              📱 Scanner {barcodeScannerActive ? "ON" : "OFF"}
            </button>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-inactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="show-inactive"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Show Inactive
              </label>
            </div>
          </div>

          {/* Scanner Status */}
          {barcodeScannerActive && (
            <div className="scanner-status bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800">
                📱 Barcode Scanner Active
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Scan a barcode to search for products
              </p>
              {scannerMessage && (
                <p className="text-sm font-semibold text-blue-900 mt-2">
                  {scannerMessage}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="loading-state bg-white p-12 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-600 font-medium">Loading products...</p>
          </div>
        ) : (
          <div className="table-wrapper bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <ProductTable
              products={filteredProducts}
              onEdit={(p) => {
                setEditing(p);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onPrint={handlePrintLabel}
              onExport={handleExportCSV}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProductForm
              initialData={editing || undefined}
              onSubmit={editing ? handleEdit : handleAdd}
              onClose={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
