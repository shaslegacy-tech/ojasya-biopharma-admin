"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { IProduct, IUser, IInventory, IOrderProduct } from "@/types";

const HospitalOrderPage: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [suppliers, setSuppliers] = useState<IUser[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [orderProducts, setOrderProducts] = useState<IOrderProduct[]>([]);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [inventory, setInventory] = useState<IInventory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, supRes, invRes] = await Promise.all([
          api.get<IProduct[]>("/products"),
          api.get<IUser[]>("/users?role=supplier"),
          api.get<IInventory[]>("/inventory"),
        ]);
        setProducts(prodRes.data);
        setSuppliers(supRes.data);
        setInventory(invRes.data);
      } catch {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  const addProduct = (productId: string) => {
    if (orderProducts.find((p) => p.productId._id === productId)) return;
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    setOrderProducts([...orderProducts, { productId: product, quantity: 1, price: 0 }]);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...orderProducts];
    updated[index].quantity = qty;
    setOrderProducts(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...orderProducts];
    updated[index].price = price;
    setOrderProducts(updated);
  };

  const validateStock = () => {
    for (const p of orderProducts) {
      const stockItem = inventory.find(
        (i) => i.productId._id === p.productId._id && i.supplierId._id === selectedSupplier
      );
      if (!stockItem || stockItem.stock < p.quantity) {
        toast.error(`Insufficient stock for ${p.productId.name}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedSupplier || orderProducts.length === 0) {
      toast.error("Supplier & products are required");
      return;
    }
    if (!validateStock()) return;

    const totalPrice = orderProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const formData = new FormData();
    formData.append("supplierId", selectedSupplier);
    formData.append("totalPrice", totalPrice.toString());
    formData.append(
      "products",
      JSON.stringify(
        orderProducts.map((p) => ({
          productId: p.productId._id,
          quantity: p.quantity,
          price: p.price,
        }))
      )
    );
    if (prescriptionFile) formData.append("prescriptionFile", prescriptionFile);

    try {
      await api.post("/orders", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Order created successfully");
      setOrderProducts([]);
      setSelectedSupplier("");
      setPrescriptionFile(null);
    } catch {
      toast.error("Failed to create order");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create Order</h2>

      <select
        value={selectedSupplier}
        onChange={(e) => setSelectedSupplier(e.target.value)}
        className="border px-2 py-1 rounded mb-4"
      >
        <option value="">Select Supplier</option>
        {suppliers.map((s) => (
          <option key={s._id} value={s._id}>{s.name}</option>
        ))}
      </select>

      <div className="mb-4">
        <h3 className="font-semibold">Add Products</h3>
        <select
          onChange={(e) => addProduct(e.target.value)}
          className="border px-2 py-1 rounded mt-2"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      {orderProducts.map((p, idx) => (
        <div key={p.productId._id} className="flex gap-2 mb-2 items-center">
          <span>{p.productId.name}</span>
          <input
            type="number"
            value={p.quantity}
            onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
            className="border px-2 py-1 rounded w-20"
            min={1}
          />
          <input
            type="number"
            value={p.price}
            onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
            className="border px-2 py-1 rounded w-24"
            min={0}
          />
        </div>
      ))}

      <div className="mb-4">
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)}
          className="border px-2 py-1 rounded"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit Order
      </button>
    </div>
  );
};

export default HospitalOrderPage;
