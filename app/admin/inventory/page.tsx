"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import InventoryForm from "./InventoryForm";
import { IInventory } from "@/types";

const AdminInventoryPage: React.FC = () => {
  const [inventories, setInventories] = useState<IInventory[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState<IInventory | null>(null);

  const fetchInventories = async () => {
    try {
      const res = await api.get<IInventory[]>("/inventory");
      setInventories(res.data);
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Failed to load inventories");
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const handleEdit = (item: IInventory) => {
    setEditingItem(item);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      toast.success("Deleted successfully");
      fetchInventories();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 relative">
      <div className="flex flex-col md:flex-row justify-between mb-6 items-center">
        <h2 className="text-3xl font-bold text-[#0f4c75] mb-3 md:mb-0">Inventory Management</h2>
        <button
          onClick={() => setOpenForm(true)}
          className="bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform font-semibold"
        >
          Add Inventory
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl">
          <thead className="bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] text-white">
            <tr>
              <th className="px-6 py-3 text-left font-semibold uppercase">Product</th>
              <th className="px-6 py-3 text-left font-semibold uppercase">Supplier</th>
              <th className="px-6 py-3 text-left font-semibold uppercase">Hospital</th>
              <th className="px-6 py-3 text-center font-semibold uppercase">Stock</th>
              <th className="px-6 py-3 text-center font-semibold uppercase">Price</th>
              <th className="px-6 py-3 text-center font-semibold uppercase">Threshold</th>
              <th className="px-6 py-3 text-center font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventories.map((item, idx) => (
              <tr
                key={item._id}
                className={`transition-transform transform hover:scale-[1.01] ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="px-6 py-4 font-medium text-gray-800">{item.productId.name}</td>
                <td className="px-6 py-4 text-gray-600">{item.supplierId.name}</td>
                <td className="px-6 py-4 text-gray-600">{item.hospitalId?.name || "-"}</td>
                <td
                  className={`px-6 py-4 text-center font-semibold ${
                    item.stock < item.threshold ? "text-red-600 animate-pulse" : ""
                  }`}
                >
                  {item.stock}
                </td>
                <td className="px-6 py-4 text-center">${item.price}</td>
                <td className="px-6 py-4 text-center">{item.threshold}</td>
                <td className="px-6 py-4 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-yellow-400 px-3 py-1 rounded-lg shadow hover:scale-105 transition-transform"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:scale-105 transition-transform"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden flex flex-col gap-4">
        {inventories.map((item, idx) => (
          <div
            key={item._id}
            className="relative p-4 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] animate-fade-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] rounded-xl blur opacity-40 hover:opacity-70 transition-opacity"></div>
            <div className="relative bg-white rounded-xl p-4 space-y-2">
              <h3 className="text-lg font-bold text-[#0f4c75]">{item.productId.name}</h3>
              <p className="text-gray-600">
                <span className="font-semibold">Supplier:</span> {item.supplierId.name}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Hospital:</span> {item.hospitalId?.name || "-"}
              </p>
              <p
                className={`text-gray-800 font-semibold ${
                  item.stock < item.threshold ? "text-red-600 animate-pulse" : ""
                }`}
              >
                Stock: {item.stock} / Threshold: {item.threshold}
              </p>
              <p className="text-gray-800 font-semibold">Price: ${item.price}</p>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-400 px-3 py-1 rounded-lg shadow hover:scale-105 transition-transform"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:scale-105 transition-transform"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {inventories.length === 0 && (
          <p className="text-center text-gray-500">No inventory found.</p>
        )}
      </div>
        {openForm && (
          <div className="absolute top-[100px] left-0 w-full z-50 flex justify-center pointer-events-none">
            {/* Floating Modal */}
            <div className="relative w-[90%] max-w-[500px] pointer-events-auto">
            {/* <div className="relative w-[90%] max-w-[500px] pointer-events-auto animate-slide-down-float"> */}
              {/* Glass Backdrop Shadow */}
              <div
                className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl"
                onClick={() => {
                  setOpenForm(false);
                  setEditingItem(null);
                }}
              ></div>

              {/* Modal Form */}
              <div className="relative z-10">
                <InventoryForm
                  close={() => {
                    setOpenForm(false);
                    setEditingItem(null);
                    fetchInventories();
                  }}
                />
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminInventoryPage;
