"use client";

type Props = {
  products: any[];
  onEdit: (product: any) => void;
};

export default function ProductTable({ products, onEdit }: Props) {
  return (
    <table className="w-full border mt-4">
      <thead>
        <tr>
          <th>Name</th>
          <th>SKU</th>
          <th>Price</th>
          <th>Stock</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <td>{p.name}</td>
            <td>{p.sku}</td>
            <td>{p.price}</td>
            <td>{p.stock}</td>
            <td>
              <button className="text-blue-600" onClick={() => onEdit(p)}>
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
