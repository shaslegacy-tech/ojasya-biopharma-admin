"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SupplierDashboard() {
  interface Order {
    _id: string;
    status: string;
    // add other order fields if needed
  }

  interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
    // add other product fields if needed
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);

  useEffect(() => {
    api.get("/supplier/orders").then((res) => setOrders(res.data));
    api.get("/supplier/inventory").then((res) => setInventory(res.data));
  }, []);

  return (
    <ProtectedRoute roles={["supplier"]}>
      <div className="grid grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        <ul>
          {orders.map((order) => (
            <li key={order._id} className="border p-2 mb-2">
              <div>
                <strong>ID:</strong> {order._id}
              </div>
              <div>
                <strong>Status:</strong> {order.status}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Inventory</h2>
        <ul>
          {inventory.map((product) => (
            <li key={product._id} className="border p-2 mb-2">
              <div>
                <strong>Name:</strong> {product.name}
              </div>
              <div>
                <strong>Price:</strong> ${product.price}
              </div>
              <div>
                <strong>Stock:</strong> {product.stock}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </ProtectedRoute>
    
  );
}
