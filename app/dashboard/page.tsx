'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/Card';
import OrdersTable from '../../components/OrdersTable';
import ProtectedRoute from '@/components/ProtectedRoute';

type Order = {
  id?: string;
  status?: 'pending' | 'delivered' | string;
  [key: string]: unknown;
};

export default function DashboardPage() {
 const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get('/hospital/orders').then(res => setOrders(res.data));
  }, []);

  const stats = [
    { title: 'Total Orders', value: 128, color: 'from-blue-500 to-cyan-400' },
    { title: 'Pending Orders', value: 24, color: 'from-orange-400 to-yellow-300' },
    { title: 'Hospitals', value: 15, color: 'from-green-400 to-teal-400' },
    { title: 'Revenue', value: '$12,450', color: 'from-purple-500 to-pink-500' },
  ];

  return (
     <ProtectedRoute roles={["hospital"]}>
      <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <Card key={s.title} title={s.title} value={s.value} gradient={s.color} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <Card title="Total Orders" value={orders.length} />
        <Card title="Pending Orders" value={orders.filter(o => o.status==='pending').length} />
        <Card title="Delivered Orders" value={orders.filter(o => o.status==='delivered').length} />
        </div>
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <OrdersTable />
      </div>
    </div>
     </ProtectedRoute>
    
  );
}
