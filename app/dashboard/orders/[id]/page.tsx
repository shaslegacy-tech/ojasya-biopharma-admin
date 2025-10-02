'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import Badge from '@/components/ui/Badge';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get<Order>(`/hospital/orders/${id}`)
      .then((res) => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-black text-center mt-10">Loading...</p>;
  if (!order) return <p className="text-red-600 text-center mt-10">Order not found</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl space-y-6">
      {/* Header */}
      <h2 className="text-3xl font-bold text-black bg-clip-text text-transparent bg-gradient-to-r from-[#0daba9] to-[#78cfce]">
        Order Details
      </h2>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-r from-[#0daba9]/20 to-[#78cfce]/20 rounded-2xl shadow">
          <p className="text-gray-600 font-medium">Order ID</p>
          <p className="text-black font-semibold">{order._id}</p>
        </div>
        <div className="p-4 bg-gradient-to-r from-[#0daba9]/20 to-[#78cfce]/20 rounded-2xl shadow">
          <p className="text-gray-600 font-medium">Status</p>
          <Badge status={order.status} />
        </div>
        <div className="p-4 bg-gradient-to-r from-[#0daba9]/20 to-[#78cfce]/20 rounded-2xl shadow">
          <p className="text-gray-600 font-medium">Total Price</p>
          <p className="text-black font-semibold">${order.totalPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h3 className="text-xl font-semibold text-black mb-4">Products</h3>
        <table className="w-full text-black border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Product Name</th>
              <th className="text-left p-3">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {order.products.map((p) => (
              <tr key={p.productId} className="hover:bg-gray-50 transition">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
