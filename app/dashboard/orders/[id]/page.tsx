"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

type Product = {
  productId: string;
  name: string;
  quantity: number;
};

type Order = {
  _id: string;
  status: string;
  totalPrice: number;
  products: Product[];
};

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Order>(`/hospital/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <p>Loading...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Order Details</h2>
      <p>
        <strong>ID:</strong> {order._id}
      </p>
      <p>
        <strong>Status:</strong> {order.status}
      </p>
      <p>
        <strong>Total Price:</strong> ${order.totalPrice}
      </p>
      <p>
        <strong>Products:</strong>
      </p>
      <ul>
        {order.products.map((p: Product) => (
          <li key={p.productId}>
            <strong>{p.name}</strong> - {p.quantity} units
          </li>
        ))}
      </ul>
    </div>
  );
}
