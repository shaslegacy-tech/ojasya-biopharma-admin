"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Order = {
  _id: string;
  status: string;
  totalPrice: number;
  // add other fields from the API response as needed
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get("/hospital/orders").then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Orders</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Order ID</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Total Price</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-100">
              <td className="border p-2">{order._id}</td>
              <td className="border p-2 capitalize">{order.status}</td>
              <td className="border p-2">${order.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
