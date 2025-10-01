"use client";

import { useEffect, useState } from "react";

interface Stock {
  _id: string;
  product: { name: string };
  hospital: { name: string };
  supplier: { email: string };
  quantity: number;
  threshold: number;
}

const fetchStocks = async (): Promise<Stock[]> => {
  const res = await fetch("/api/stocks");
  if (!res.ok) throw new Error("Failed to fetch stocks");
  return res.json();
};

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStocks()
      .then(setStocks)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Stocks List</h1>
      {error && <p className="text-red-500">{error}</p>}
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Product</th>
            <th className="border px-4 py-2">Hospital</th>
            <th className="border px-4 py-2">Supplier</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Threshold</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock._id}>
              <td className="border px-4 py-2">{stock.product.name}</td>
              <td className="border px-4 py-2">{stock.hospital.name}</td>
              <td className="border px-4 py-2">{stock.supplier.email}</td>
              <td className="border px-4 py-2">{stock.quantity}</td>
              <td className="border px-4 py-2">{stock.threshold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
