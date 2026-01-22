/**
 * Hardware Integration Utilities
 * Supports barcode scanners, printers, and hardware devices
 */

export type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  isActive?: boolean;
};

/**
 * Check if browser supports print functionality
 */
export const canPrint = (): boolean => {
  return typeof window !== "undefined" && !!window.print;
};

/**
 * Generate barcode HTML (CODE128 format using Unicode box drawing)
 * For production, consider using a barcode library like JsBarcode
 */
export const generateBarcodeHTML = (sku: string): string => {
  // This is a simple representation; in production use JsBarcode or similar
  return `
    <div style="font-family: monospace; text-align: center; margin: 10px 0;">
      <div style="font-size: 24px; letter-spacing: 2px;">*${sku}*</div>
      <div style="font-size: 12px; color: #666;">${sku}</div>
    </div>
  `;
};

/**
 * Print a single product barcode label
 */
export const printProductLabel = (product: Product, copies: number = 1) => {
  const window_ = window.open("", "", "width=400,height=300");
  if (!window_) {
    console.error("Failed to open print window. Check popup settings.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print - ${product.sku}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
        .label { 
          page-break-after: always; 
          margin-bottom: 20px; 
          border: 1px solid #ccc;
          padding: 20px;
          width: 3in;
          height: 2in;
          box-sizing: border-box;
        }
        .sku { font-family: monospace; font-weight: bold; font-size: 18px; margin: 10px 0; }
        .name { font-size: 14px; font-weight: bold; margin: 5px 0; }
        .price { font-size: 16px; font-weight: bold; color: green; margin: 5px 0; }
        .barcode { font-family: monospace; font-size: 24px; letter-spacing: 2px; margin: 10px 0; text-align: center; }
        @media print { body { margin: 0; padding: 0; } }
      </style>
    </head>
    <body>
      ${Array(copies)
        .fill(0)
        .map(
          () => `
        <div class="label">
          <div class="name">${product.name}</div>
          <div class="sku">SKU: ${product.sku}</div>
          <div class="barcode">*${product.sku}*</div>
          <div class="price">$${product.price.toFixed(2)}</div>
        </div>
      `
        )
        .join("")}
    </body>
    </html>
  `;

  window_.document.write(html);
  window_.document.close();
  window_.print();
};

/**
 * Print multiple product labels
 */
export const printMultipleLabels = (products: Product[], copiesPerProduct: number = 1) => {
  const window_ = window.open("", "", "width=400,height=300");
  if (!window_) {
    console.error("Failed to open print window. Check popup settings.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Labels</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
        .label { 
          page-break-after: always; 
          margin-bottom: 20px; 
          border: 1px solid #ccc;
          padding: 20px;
          width: 3in;
          height: 2in;
          box-sizing: border-box;
        }
        .sku { font-family: monospace; font-weight: bold; font-size: 18px; margin: 10px 0; }
        .name { font-size: 14px; font-weight: bold; margin: 5px 0; }
        .price { font-size: 16px; font-weight: bold; color: green; margin: 5px 0; }
        .barcode { font-family: monospace; font-size: 24px; letter-spacing: 2px; margin: 10px 0; text-align: center; }
        @media print { body { margin: 0; padding: 0; } }
      </style>
    </head>
    <body>
      ${products
        .map(
          (product) =>
            `${Array(copiesPerProduct)
              .fill(0)
              .map(
                () => `
        <div class="label">
          <div class="name">${product.name}</div>
          <div class="sku">SKU: ${product.sku}</div>
          <div class="barcode">*${product.sku}*</div>
          <div class="price">$${product.price.toFixed(2)}</div>
        </div>
      `
              )
              .join("")}`
        )
        .join("")}
    </body>
    </html>
  `;

  window_.document.write(html);
  window_.document.close();
  window_.print();
};

/**
 * Export products to CSV format
 */
export const exportProductsToCSV = (products: Product[], filename: string = "products.csv") => {
  const headers = ["SKU", "Name", "Price", "Cost", "Profit", "Margin %", "Stock", "Status"];
  
  const rows = products.map((p) => {
    const profit = p.price - p.cost;
    const margin = p.cost > 0 ? (((p.price - p.cost) / p.cost) * 100).toFixed(1) : "0";
    return [
      p.sku,
      `"${p.name}"`, // Quote name in case it contains commas
      p.price.toFixed(2),
      p.cost.toFixed(2),
      profit.toFixed(2),
      margin,
      p.stock,
      p.isActive ? "Active" : "Inactive",
    ];
  });

  const csvContent =
    [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Listen for barcode scanner input
 * Barcode scanners typically send data as a rapid sequence of keyboard events followed by Enter
 * This utility captures that input and triggers a callback
 */
export class BarcodeScanner {
  private buffer: string = "";
  private timeout: NodeJS.Timeout | null = null;
  private readonly TIMEOUT_MS = 100; // Time to wait for more input before treating as complete

  constructor(private onScan: (barcode: string) => void) {
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  private handleKeydown(e: KeyboardEvent) {
    const key = e.key;

    // Ignore if modifier keys are pressed (but allow normal typing)
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    if (key === "Enter") {
      // Scanner complete - trigger callback with buffered input
      if (this.buffer.length > 0) {
        this.onScan(this.buffer);
        this.buffer = "";
      }
    } else if (key.length === 1 || key === "Backspace") {
      // Accumulate characters
      if (key === "Backspace") {
        this.buffer = this.buffer.slice(0, -1);
      } else {
        this.buffer += key;
      }

      // Reset timeout
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      // Set new timeout to clear buffer if no more input
      this.timeout = setTimeout(() => {
        this.buffer = "";
      }, this.TIMEOUT_MS);
    }
  }

  /**
   * Start listening for barcode scanner input
   */
  public start() {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", this.handleKeydown);
    }
  }

  /**
   * Stop listening for barcode scanner input
   */
  public stop() {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", this.handleKeydown);
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}

/**
 * Check if a device supports hardware printing
 */
export const supportsHardwarePrinting = (): boolean => {
  return typeof window !== "undefined" && !!window.print;
};

/**
 * Generate a print-friendly view of products
 */
export const getPrintableProductsHTML = (products: Product[]): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Products Inventory Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          background: white;
        }
        h1 {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        td {
          border: 1px solid #ddd;
          padding: 10px;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .status-active {
          color: green;
          font-weight: bold;
        }
        .status-inactive {
          color: red;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body {
            margin: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>Product Inventory Report</h1>
      <p style="text-align: center; color: #666;">
        Generated on ${new Date().toLocaleString()}
      </p>
      
      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Price</th>
            <th>Cost</th>
            <th>Profit</th>
            <th>Margin</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (p) => {
                const profit = p.price - p.cost;
                const margin = p.cost > 0 ? (((p.price - p.cost) / p.cost) * 100).toFixed(1) : "0";
                return `
            <tr>
              <td><strong>${p.sku}</strong></td>
              <td>${p.name}</td>
              <td>$${p.price.toFixed(2)}</td>
              <td>$${p.cost.toFixed(2)}</td>
              <td>$${profit.toFixed(2)}</td>
              <td>${margin}%</td>
              <td>${p.stock}</td>
              <td class="${p.isActive ? "status-active" : "status-inactive"}">
                ${p.isActive ? "Active" : "Inactive"}
              </td>
            </tr>
          `;
              }
            )
            .join("")}
        </tbody>
      </table>

      <div class="footer">
        <p>Total Products: ${products.length}</p>
        <p>Total Stock Value: $${products
          .reduce((sum, p) => sum + p.price * p.stock, 0)
          .toFixed(2)}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Open print preview with products report
 */
export const printProductsReport = (products: Product[]) => {
  const window_ = window.open("", "print_preview");
  if (!window_) {
    console.error("Failed to open print preview window");
    return;
  }
  window_.document.write(getPrintableProductsHTML(products));
  window_.document.close();
  window_.print();
};
