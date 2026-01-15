"use client";

type Props = {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
};

export default function ProductTable({ products, onEdit, onDelete }: Props) {
  return (
    <table className="w-full border mt-4">
      <thead>
        <tr>
          <th>Name</th>
          <th>SKU</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <td>{p.name}</td>
            <td>{p.sku}</td>
            <td>${p.price.toFixed(2)}</td>
            <td>{p.stock}</td>
            <td className="flex gap-2">
              <button className="text-blue-600 hover:text-blue-800" onClick={() => onEdit(p)}>
                Edit
              </button>
              <button className="text-red-600 hover:text-red-800" onClick={() => onDelete(p)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
