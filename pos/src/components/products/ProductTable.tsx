"use client";

import { useState, useMemo } from "react";

type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  isActive?: boolean;
};

type Props = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPrint?: (product: Product) => void;
  onExport?: () => void;
};

type SortKey = "name" | "sku" | "price" | "stock" | "margin";
type SortDirection = "asc" | "desc";

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onPrint,
  onExport,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const itemsPerPage = 10;

  // Filter products
  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Sort products
  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let aVal: any, bVal: any;
      
      if (sortKey === "margin") {
        aVal = a.price - a.cost;
        bVal = b.price - b.cost;
      } else {
        aVal = a[sortKey];
        bVal = b[sortKey];
      }

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedData = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((p) => p.id)));
    }
  };

  const handleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const isStockLow = (stock: number) => stock < 10;
  const isOutOfStock = (stock: number) => stock === 0;
  const getMargin = (price: number, cost: number) => {
    return cost > 0 ? (((price - cost) / cost) * 100).toFixed(1) : "0";
  };

  return (
    <div className="product-table-container space-y-4">
      {/* Toolbar */}
      <div className="product-toolbar bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="toolbar-actions flex gap-2">
          {selectedIds.size > 0 && (
            <span className="text-sm text-gray-600 font-medium">
              {selectedIds.size} selected
            </span>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="export-btn px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              title="Export to CSV"
            >
              ↓ Export
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="product-table-wrapper overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left w-8">
                <input
                  type="checkbox"
                  checked={
                    paginatedData.length > 0 &&
                    selectedIds.size === paginatedData.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th
                onClick={() => handleSort("sku")}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
              >
                SKU {sortKey === "sku" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("name")}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
              >
                Name {sortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("price")}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
              >
                Price {sortKey === "price" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Cost
              </th>
              <th
                onClick={() => handleSort("margin")}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
              >
                Margin {sortKey === "margin" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("stock")}
                className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
              >
                Stock {sortKey === "stock" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              paginatedData.map((product) => {
                const margin = getMargin(product.price, product.cost);
                const isSelected = selectedIds.has(product.id);
                return (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-200 hover:bg-blue-50 transition ${
                      isSelected ? "bg-blue-100" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      ${product.cost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-700">
                      {margin}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          isOutOfStock(product.stock)
                            ? "bg-red-100 text-red-800"
                            : isStockLow(product.stock)
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="action-buttons flex gap-2 justify-center">
                        {onPrint && (
                          <button
                            onClick={() => onPrint(product)}
                            className="action-btn print-btn p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Print barcode"
                          >
                            🖨
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(product)}
                          className="action-btn edit-btn p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit product"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => onDelete(product)}
                          className="action-btn delete-btn p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete product"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="pagination-info text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sorted.length)} of{" "}
            {sorted.length} products
          </div>
          <div className="pagination-controls flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="pagination-btn px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              ← Prev
            </button>
            <div className="pagination-numbers flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pagination-number px-3 py-2 rounded-lg transition ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
