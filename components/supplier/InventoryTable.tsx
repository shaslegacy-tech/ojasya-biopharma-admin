"use client";
import { useState, useEffect, ChangeEvent } from "react";
import api from "@/lib/api";
import { Pencil, Check, X } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

export default function InventoryTable() {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ price: number; stock: number }>({ price: 0, stock: 0 });

  useEffect(() => {
    api.get("/supplier/inventory").then(res => setInventory(res.data));
  }, []);

  // Filtered & searched inventory
  const filteredInventory = inventory.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    if (stockFilter === "low") matchesFilter = product.stock < 50;
    if (stockFilter === "medium") matchesFilter = product.stock >= 50 && product.stock <= 200;
    if (stockFilter === "high") matchesFilter = product.stock > 200;
    return matchesSearch && matchesFilter;
  });

  // Inline edit handlers
  const startEdit = (product: Product) => {
    setEditingId(product._id);
    setEditData({ price: product.price, stock: product.stock });
  };
  const cancelEdit = () => setEditingId(null);
  const saveEdit = async (id: string) => {
    try {
      await api.put(`/supplier/inventory/${id}`, editData);
      setInventory(prev =>
        prev.map(p => (p._id === id ? { ...p, price: editData.price, stock: editData.stock } : p))
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // Event handlers with proper types
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setStockFilter(e.target.value as "all" | "low" | "medium" | "high");

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Inventory</h2>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          className="border p-2 rounded-lg w-full md:w-1/2"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select
          className="border p-2 rounded-lg w-full md:w-1/4"
          value={stockFilter}
          onChange={handleFilterChange}
        >
          <option value="all">All stock</option>
          <option value="low">Low (&lt;50)</option>
          <option value="medium">Medium (50-200)</option>
          <option value="high">High (&gt;200)</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Price ($)</th>
              <th className="p-3 border-b">Stock</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(product => (
              <tr key={product._id} className="hover:bg-gray-50 transition">
                <td className="p-3 border-b">{product.name}</td>
                <td className="p-3 border-b">
                  {editingId === product._id ? (
                    <input
                      type="number"
                      value={editData.price}
                      onChange={e => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                      className="border rounded p-1 w-24"
                    />
                  ) : (
                    product.price.toFixed(2)
                  )}
                </td>
                <td className="p-3 border-b">
                  {editingId === product._id ? (
                    <input
                      type="number"
                      value={editData.stock}
                      onChange={e => setEditData({ ...editData, stock: parseInt(e.target.value) })}
                      className="border rounded p-1 w-20"
                    />
                  ) : (
                    product.stock
                  )}
                </td>
                <td className="p-3 border-b">
                  {editingId === product._id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(product._id)}
                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(product)}
                      className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
