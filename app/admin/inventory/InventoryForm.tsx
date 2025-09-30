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
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-lg w-96 flex flex-col gap-3"
      >
        <h2 className="text-lg font-bold">{editingItem ? "Edit Inventory" : "Add Inventory"}</h2>

        <select
          required
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="border px-2 py-1 rounded"
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
          className="border px-2 py-1 rounded"
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
          className="border px-2 py-1 rounded"
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
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="number"
          placeholder="Threshold"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="border px-2 py-1 rounded"
          required
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={close} className="px-4 py-1 rounded border">
            Cancel
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
            {editingItem ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
