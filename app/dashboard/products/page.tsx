// app/hospital/products/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { IProduct } from "@/types";

export default function HospitalProductPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get<IProduct[]>("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRequest = async (product: IProduct) => {
    try {
      const quantity = prompt(`Enter quantity to request for ${product.name}:`);
      if (!quantity) return;

      await api.post("/orders", {
        products: [{ productId: product._id, quantity: parseInt(quantity), price: product.price }],
      });

      alert("Product request sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    }
  };

  if (loading) return <div className="p-6">Loading products...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Available Products</h1>
      <table className="w-full border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Brand</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Unit</th>
            <th className="border p-2">Images</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">{p.brand || "-"}</td>
              <td className="border p-2">{p.price}</td>
              <td className="border p-2">{p.unit}</td>
              <td className="border p-2 flex gap-2">
                {p.images.map((img, idx) => (
                  <img key={idx} src={img} alt={p.name} className="h-12 w-12 object-cover rounded border" />
                ))}
              </td>
              <td className="border p-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => handleRequest(p)}
                >
                  Request
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
