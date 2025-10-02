// app/supplier/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardCards from "@/components/supplier/SupplierDashboard";
import OrdersChart from "@/components/supplier/OrdersChart";
import RecentOrdersTable from "@/components/supplier/RecentOrdersTable";
import NotificationsPanel from "@/components/supplier/NotificationsPanel";
import InventoryTable from "@/components/supplier/InventoryTable";
import { Package, FileText, Users, BarChart2 } from "lucide-react";

interface Order {
  _id: string;
  status: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

interface Notification {
  id: string;
  message: string;
  date: string;
}

export default function SupplierDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    api.get("/supplier/orders").then(res => setOrders(res.data));
    api.get("/supplier/inventory").then(res => setInventory(res.data));
    // Mock notifications
    setNotifications([
      { id: "1", message: "New order received", date: "2025-10-02" },
      { id: "2", message: "Inventory running low", date: "2025-10-01" },
      { id: "3", message: "Payment received", date: "2025-09-30" },
    ]);
  }, []);

  // Dashboard cards data
  const cardsData = [
    { title: "Orders", value: orders.length, icon: FileText, gradient: "from-green-400 to-teal-500" },
    { title: "Inventory", value: inventory.length, icon: Package, gradient: "from-teal-400 to-green-500" },
    { title: "Hospitals", value: 24, icon: Users, gradient: "from-green-500 to-teal-600" },
    { title: "Revenue", value: "$12.4K", icon: BarChart2, gradient: "from-teal-500 to-green-700" },
  ];

  return (
    <ProtectedRoute roles={["supplier"]}>
      <div className="space-y-5">
        {/* Dashboard Cards */}
        <DashboardCards data={cardsData} />
        {/* Charts + Notifications */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <OrdersChart orders={orders} />
          </div>
          <NotificationsPanel notifications={notifications} />
        </div>
        <InventoryTable />
        {/* Recent Orders */}
        <RecentOrdersTable orders={orders.slice(0, 5)} />
      </div>
    </ProtectedRoute>
  );
}
