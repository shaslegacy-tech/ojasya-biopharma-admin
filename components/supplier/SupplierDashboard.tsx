// components/supplier/SupplierDashboard.tsx
"use client";
import React from "react";

export default function SupplierDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Supplier Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white shadow p-4 rounded">Total Orders: 24</div>
        <div className="bg-white shadow p-4 rounded">Pending Orders: 5</div>
        <div className="bg-white shadow p-4 rounded">Inventory Items: 120</div>
      </div>
      <div className="bg-white shadow p-4 rounded mt-6">
        <h2 className="font-semibold mb-2">Recent Orders</h2>
        <p>Order table or charts go here...</p>
      </div>
    </div>
  );
}
