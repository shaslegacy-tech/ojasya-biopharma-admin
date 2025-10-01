"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import ProductForm from "@/components/products/ProductForm";
import { IProduct } from "@/types";

export default function ProductListPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [editing, setEditing] = useState<IProduct | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await api.get<IProduct[]>("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: IProduct) => {
    setEditing(product);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure to delete?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleCreate}
        >
          Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editing || undefined}
          onSuccess={() => {
            setShowForm(false);
            fetchProducts();
          }}
        />
      )}

      <table className="w-full border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Unit</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">{p.price}</td>
              <td className="border p-2">{p.unit}</td>
              <td className="border p-2 flex gap-2">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  onClick={() => handleEdit(p)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  onClick={() => handleDelete(p._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
