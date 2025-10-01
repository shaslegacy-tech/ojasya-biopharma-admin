// admin/product/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import ProductForm from "@/components/products/ProductForm";
import { IProduct } from "@/types";
import CountUp from "react-countup"; // npm install react-countup

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
    <div className="space-y-6 p-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          className="bg-gradient-to-r from-[#00bfa6] via-[#0072ff] to-[#00ffd5] text-white px-4 py-2 rounded-lg hover:scale-105 transition shadow-lg"
          onClick={handleCreate}
        >
          Add Product
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse border shadow-lg rounded-xl overflow-hidden">
          <thead className="bg-gradient-to-r from-[#00bfa6] via-[#0072ff] to-[#00ffd5] text-white">
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
              <tr key={p._id} className="border-b hover:bg-gray-50 transition">
                <td className="border p-2 flex items-center gap-2">
                  {p.images && p.images[0] && (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  {p.name}
                </td>
                <td className="border p-2">{p.category}</td>
                <td className="border p-2 font-mono">
                  <CountUp end={p.price} duration={1} separator="," prefix="₹" />
                </td>
                <td className="border p-2">{p.unit}</td>
                <td className="border p-2 flex gap-2 justify-center">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
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

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-white shadow-lg rounded-xl p-4 border-l-4 border-gradient-to-r from-[#00bfa6] via-[#0072ff] to-[#00ffd5] flex flex-col gap-2 hover:scale-102 transition transform"
          >
            <div className="flex gap-3 items-center">
              {p.images && p.images[0] && (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-16 h-16 object-cover rounded border"
                />
              )}
              <h2 className="text-lg font-bold">{p.name}</h2>
            </div>
            <p>
              <span className="font-semibold">Category:</span> {p.category}
            </p>
            <p className="font-mono">
              <span className="font-semibold">Price:</span>{" "}
              <CountUp end={p.price} duration={1} separator="," prefix="₹" />
            </p>
            <p>
              <span className="font-semibold">Unit:</span> {p.unit}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                onClick={() => handleEdit(p)}
              >
                Edit
              </button>
              <button
                className="flex-1 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                onClick={() => handleDelete(p._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 flex justify-center items-start z-50 overflow-auto">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-md"
            onClick={() => setShowForm(false)}
          ></div>

          {/* Modal Body */}
          <div className="relative w-[90%] max-w-5xl mt-20 p-8 rounded-2xl shadow-2xl
                          bg-gradient-to-br from-white/90 to-gray-100/90
                          border border-white/30 backdrop-blur-lg
                          animate-fadeInDown transition-transform transform">
            <ProductForm
              product={editing || undefined}
              onSuccess={() => {
                setShowForm(false);
                fetchProducts();
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
