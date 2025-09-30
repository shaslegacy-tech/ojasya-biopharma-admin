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
  if (err instanceof Error) {
    toast.error(err.message);
  } else {
    toast.error("Failed to load inventories");
  }
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
  if (err instanceof Error) {
    toast.error(err.message);
  } else {
    toast.error("Delete failed");
  }
}
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Inventory Management</h2>
        <button
          onClick={() => setOpenForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Inventory
        </button>
      </div>

      <table className="min-w-full table-auto border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Product</th>
            <th className="px-4 py-2 border">Supplier</th>
            <th className="px-4 py-2 border">Hospital</th>
            <th className="px-4 py-2 border">Stock</th>
            <th className="px-4 py-2 border">Price</th>
            <th className="px-4 py-2 border">Threshold</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventories.map((item) => (
            <tr key={item._id} className="text-center">
              <td className="px-4 py-2 border">{item.productId.name}</td>
              <td className="px-4 py-2 border">{item.supplierId.name}</td>
              <td className="px-4 py-2 border">{item.hospitalId?.name || "-"}</td>
              <td
                className={`px-4 py-2 border ${
                  item.stock < item.threshold ? "text-red-600 font-bold" : ""
                }`}
              >
                {item.stock}
              </td>
              <td className="px-4 py-2 border">{item.price}</td>
              <td className="px-4 py-2 border">{item.threshold}</td>
              <td className="px-4 py-2 border flex justify-center gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {openForm && (
        <InventoryForm
          close={() => {
            setOpenForm(false);
            setEditingItem(null);
            fetchInventories();
          }}
          editingItem={editingItem}
        />
      )}
    </div>
  );
};

export default AdminInventoryPage;
