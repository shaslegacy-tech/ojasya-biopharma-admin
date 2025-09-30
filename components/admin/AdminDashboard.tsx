// components/admin/AdminDashboard.tsx
"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { IOrder, IInventory, IUser } from "@/types";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [inventory, setInventory] = useState<IInventory[]>([]);
  const [hospitals, setHospitals] = useState<IUser[]>([]);
  const [suppliers, setSuppliers] = useState<IUser[]>([]);

  const fetchData = async () => {
    try {
      const [ordersRes, inventoryRes, usersRes] = await Promise.all([
        api.get<IOrder[]>("/orders"),
        api.get<IInventory[]>("/inventory"),
        api.get<IUser[]>("/users"),
      ]);

      setOrders(ordersRes.data);
      setInventory(inventoryRes.data);
      setHospitals(usersRes.data.filter((u) => u.role === "hospital"));
      setSuppliers(usersRes.data.filter((u) => u.role === "supplier"));
    } catch {
      toast.error("Failed to fetch dashboard data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const lowStockItems = inventory.filter((i) => i.stock < i.threshold).length;

  const revenueBySupplier = suppliers.map((s) => {
    const total = orders
      .filter((o) => o.supplierId._id === s._id && o.status === "delivered")
      .reduce((sum, o) => sum + o.totalPrice, 0);
    return { name: s.name, revenue: total };
  });

  const statusCounts = [
    { name: "Pending", value: orders.filter((o) => o.status === "pending").length },
    { name: "Accepted", value: orders.filter((o) => o.status === "accepted").length },
    { name: "Delivered", value: orders.filter((o) => o.status === "delivered").length },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold">Total Hospitals</h3>
          <p className="text-xl font-bold">{hospitals.length}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold">Total Suppliers</h3>
          <p className="text-xl font-bold">{suppliers.length}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold">Pending Orders</h3>
          <p className="text-xl font-bold">{pendingOrders}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold">Low Stock Items</h3>
          <p className="text-xl font-bold">{lowStockItems}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold mb-2">Revenue by Supplier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueBySupplier}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold mb-2">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusCounts}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold mb-2">Recent Orders</h3>
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Hospital</th>
                <th className="px-4 py-2 border">Supplier</th>
                <th className="px-4 py-2 border">Products</th>
                <th className="px-4 py-2 border">Total</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter((o) => o.createdAt)
                .sort(
                  (a, b) =>
                    new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
                )
                .slice(0, 5)
                .map((o) => (
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

        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold mb-2">Low Stock Alerts</h3>
          {inventory.filter((i) => i.stock < i.threshold).length === 0 ? (
            <p>No low stock items</p>
          ) : (
            <ul className="list-disc pl-5">
              {inventory
                .filter((i) => i.stock < i.threshold)
                .map((i) => (
                  <li key={i._id}>
                    {i.productId.name} – Stock: {i.stock} (Threshold: {i.threshold})
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
