'use client';
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatsCard from '@/components/hospital/StatsCard';
import ChartCard from '@/components/hospital/ChartCard';
import NotificationPanel from '@/components/hospital/NotificationPanel';
import OrdersTable from '@/components/hospital/OrdersTable';
import { ClipboardList, Clock, CheckCircle, DollarSign } from 'lucide-react';
import api from '@/lib/api';

type Order = {
  id: string;
  customer: string;
  orderNumber: string;
  status: 'pending' | 'delivered';
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState([
    { id: '1', message: 'New order #125 received', time: '2 min ago' },
    { id: '2', message: 'Order #124 delivered', time: '1 hr ago' },
    { id: '3', message: 'Patient profile updated', time: '3 hr ago' },
  ]);

  const [chartData, setChartData] = useState([
    { name: 'Jan', value: 30 },
    { name: 'Feb', value: 45 },
    { name: 'Mar', value: 60 },
    { name: 'Apr', value: 80 },
    { name: 'May', value: 70 },
    { name: 'Jun', value: 95 },
  ]);

  useEffect(() => {
    api.get('/hospital/orders').then(res => setOrders(res.data));
  }, []);

  // Simulate dynamic chart update
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => prev.map(d => ({ ...d, value: Math.floor(Math.random() * 100) + 20 })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { title: 'Total Orders', value: orders.length, icon: <ClipboardList className="h-6 w-6" />, gradient: 'from-[#0daba9] to-[#78cfce]' },
    { title: 'Pending Orders', value: orders.filter(o => o.status==='pending').length, icon: <Clock className="h-6 w-6" />, gradient: 'from-[#f97316] to-[#facc15]' },
    { title: 'Delivered Orders', value: orders.filter(o => o.status==='delivered').length, icon: <CheckCircle className="h-6 w-6" />, gradient: 'from-[#16a34a] to-[#5eead4]' },
    { title: 'Revenue', value: '$12,450', icon: <DollarSign className="h-6 w-6" />, gradient: 'from-[#a855f7] to-[#ec4899]' },
  ];

  return (
    <ProtectedRoute roles={["hospital"]}>
      <div className="space-y-6">

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map(s => <StatsCard key={s.title} {...s} />)}
        </div>

        {/* Charts & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Orders Trend" data={chartData} textColor="black" />
          <ChartCard title="Revenue Trend" data={chartData} textColor="black" />
          <NotificationPanel notifications={notifications} title="Notifications"/>
        </div>

        {/* Orders Table */}
        <div className="bg-gradient-to-br from-[#0daba9]/10 to-[#78cfce]/10 backdrop-blur-md rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Recent Orders</h2>
          <OrdersTable orders={orders} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
