"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { IInventory, IProduct, IUser } from "@/types";

interface InventoryFormProps {
  close: () => void;
  editingItem?: IInventory | null;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ close, editingItem }) => {
  const [productId, setProductId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [hospitalId, setHospitalId] = useState<string>("");
  const [stock, setStock] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(10);

  const [products, setProducts] = useState<IProduct[]>([]);
  const [suppliers, setSuppliers] = useState<IUser[]>([]);
  const [hospitals, setHospitals] = useState<IUser[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [prodRes, supRes, hospRes] = await Promise.all([
          api.get<IProduct[]>("/products"),
          api.get<IUser[]>("/users?role=supplier"),
          api.get<IUser[]>("/users?role=hospital"),
        ]);
        setProducts(prodRes.data);
        setSuppliers(supRes.data);
        setHospitals(hospRes.data);
      } catch {
        toast.error("Failed to load dropdown options");
      }
    };
    fetchOptions();

    if (editingItem) {
      setProductId(editingItem.productId._id);
      setSupplierId(editingItem.supplierId._id);
      setHospitalId(editingItem.hospitalId?._id || "");
      setStock(editingItem.stock);
      setPrice(editingItem.price);
      setThreshold(editingItem.threshold);
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/inventory/${editingItem._id}`, { stock, price, threshold });
        toast.success("Updated successfully");
      } else {
        await api.post("/inventory", {
          productId,
          supplierId,
          hospitalId: hospitalId || null,
          stock,
          price,
          threshold,
        });
        toast.success("Created successfully");
      }
      close();
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full p-8 flex flex-col gap-6 border-t-6 border-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] max-h-[75vh] overflow-y-auto"
    >
      {/* Form Header */}
      <h2 className="text-3xl font-bold text-[#0f4c75] mb-6">
        {editingItem ? "Edit Inventory" : "Add Inventory"}
      </h2>

      {/* Vertical Form Fields */}
      <div className="flex flex-col gap-5 w-full">
        <select
          required
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="border px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#00bfa6]"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          required
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="border px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#00bfa6]"
        >
          <option value="">Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={hospitalId}
          onChange={(e) => setHospitalId(e.target.value)}
          className="border px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#00bfa6]"
        >
          <option value="">Select Hospital (Optional)</option>
          {hospitals.map((h) => (
            <option key={h._id} value={h._id}>
              {h.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          className="border px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#00bfa6]"
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="border px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#00bfa6]"
          required
        />

        <input
          type="number"
          placeholder="Threshold"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="border px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#00bfa6]"
          required
        />
      </div>

      {/* Actions */}
       <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={close}
          className="px-6 py-3 rounded-xl border hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] text-white font-semibold hover:scale-105 transition-transform"
        >
          {editingItem ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default InventoryForm;
