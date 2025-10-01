"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Define a proper Order interface
interface Order {
  _id: string;
  status: "pending" | "processing" | "completed" | "cancelled" | string;
}

interface OrdersChartProps {
  orders: Order[];
}

export default function OrdersChart({ orders }: OrdersChartProps) {
  // Prepare chart data: count orders per status
  const data = [
    { name: "Pending", count: orders.filter(o => o.status === "pending").length },
    { name: "Processing", count: orders.filter(o => o.status === "processing").length },
    { name: "Completed", count: orders.filter(o => o.status === "completed").length },
    { name: "Cancelled", count: orders.filter(o => o.status === "cancelled").length },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Orders Overview</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
