"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Hospital = Record<string, unknown>;
type Supplier = Record<string, unknown>;
type Order = Record<string, unknown>;

export default function AdminDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get("/admin/hospitals").then((res) => setHospitals(res.data));
    api.get("/admin/suppliers").then((res) => setSuppliers(res.data));
    api.get("/admin/orders").then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Hospitals</h2>
        <p>Total: {hospitals.length}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Suppliers</h2>
        <p>Total: {suppliers.length}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        <p>Total: {orders.length}</p>
      </div>
    </div>
  );
}
