"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { IOrder, OrderStatus } from "@/types";

const SupplierOrderPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const fetchOrders = async () => {
    try {
      const res = await api.get<IOrder[]>("/orders"); // backend filters by supplier
      setOrders(res.data);
    } catch {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.put(`/orders/${id}`, { status });
      toast.success("Status updated");
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(
    (o) => statusFilter === "all" || o.status === statusFilter
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Supplier Orders</h2>

      <div className="flex items-center gap-4 mb-4">
        <label>Status Filter:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <table className="min-w-full table-auto border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Hospital</th>
            <th className="px-4 py-2 border">Products</th>
            <th className="px-4 py-2 border">Total Price</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Prescription</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order._id} className="text-center">
              <td className="px-4 py-2 border">{order.hospitalId.name}</td>
              <td className="px-4 py-2 border">
                {order.products.map((p) => `${p.productId.name} (${p.quantity})`).join(", ")}
              </td>
              <td className="px-4 py-2 border">{order.totalPrice}</td>
              <td className="px-4 py-2 border">{order.status}</td>
              <td className="px-4 py-2 border">
                {order.prescriptionFileUrl ? (
                  <a
                    href={order.prescriptionFileUrl}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-2 border flex justify-center gap-2">
                {order.status === "pending" && (
                  <button
                    onClick={() => updateStatus(order._id, "accepted")}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Accept
                  </button>
                )}
                {order.status === "accepted" && (
                  <button
                    onClick={() => updateStatus(order._id, "delivered")}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Deliver
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierOrderPage;
