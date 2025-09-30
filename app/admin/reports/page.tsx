"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { IOrder, IInventory, OrderStatus } from "@/types";

const AdminReportsPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [inventory, setInventory] = useState<IInventory[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const fetchData = async () => {
    try {
      const [ordersRes, inventoryRes] = await Promise.all([
        api.get<IOrder[]>("/orders"),
        api.get<IInventory[]>("/inventory/low-stock"),
      ]);
      setOrders(ordersRes.data);
      setInventory(inventoryRes.data);
    } catch {
      toast.error("Failed to fetch reports");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOrders = orders.filter(
    (o) => statusFilter === "all" || o.status === statusFilter
  );

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = filteredOrders.length;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Reports</h2>

      <div className="flex gap-4 mb-6 items-center">
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

        <span className="ml-auto font-semibold">Total Orders: {totalOrders}</span>
        <span className="ml-4 font-semibold">Total Revenue: ₹{totalRevenue}</span>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Low Stock Alerts</h3>
        {inventory.length === 0 ? (
          <p>No low stock items</p>
        ) : (
          <ul className="list-disc pl-5">
            {inventory.map((i) => (
              <li key={i._id}>
                {i.productId.name} – Stock: {i.stock} (Threshold: {i.threshold})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2">Orders Summary</h3>
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Hospital</th>
              <th className="px-4 py-2 border">Supplier</th>
              <th className="px-4 py-2 border">Products</th>
              <th className="px-4 py-2 border">Total Price</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o._id} className="text-center">
                <td className="px-4 py-2 border">{o.hospitalId.name}</td>
                <td className="px-4 py-2 border">{o.supplierId.name}</td>
                <td className="px-4 py-2 border">
                  {o.products.map((p) => `${p.productId.name} (${p.quantity})`).join(", ")}
                </td>
                <td className="px-4 py-2 border">{o.totalPrice}</td>
                <td className="px-4 py-2 border">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReportsPage;
