"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateStockPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    product: "",
    hospital: "",
    quantity: 0,
    threshold: 10,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create stock");
      router.push("/stocks");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create Stock</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Product ID</label>
          <input
            name="product"
            value={form.product}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Hospital ID</label>
          <input
            name="hospital"
            value={form.hospital}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            min={0}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Threshold</label>
          <input
            type="number"
            name="threshold"
            value={form.threshold}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            min={0}
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create
        </button>
      </form>
    </div>
  );
}
