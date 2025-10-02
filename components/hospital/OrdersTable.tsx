'use client';
import React from 'react';
import { Badge } from './Badge';

interface Order {
  id: string;
  customer: string;
  orderNumber: string;
  status: 'pending' | 'delivered';
}

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl shadow-lg bg-gradient-to-br from-[#0daba9]/10 to-[#78cfce]/10 backdrop-blur-md p-4">
        <table className="min-w-full text-left">
            <thead className="border-b border-black/30">
            <tr>
                <th className="px-4 py-2 text-black font-semibold">Customer</th>
                <th className="px-4 py-2 text-black font-semibold">Order #</th>
                <th className="px-4 py-2 text-black font-semibold">Status</th>
            </tr>
            </thead>
            <tbody>
            {orders.map(order => (
                <tr key={order.id} className="hover:bg-black/10 transition">
                <td className="px-4 py-2 text-black font-medium">{order.customer}</td>
                <td className="px-4 py-2 text-black font-medium">{order.orderNumber}</td>
                <td className="px-4 py-2"><Badge status={order.status} /></td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>


  );
}
