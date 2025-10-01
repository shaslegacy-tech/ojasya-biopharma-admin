// components/supplier/RecentOrdersTable.tsx
"use client";
interface Order {
  _id: string;
  status: string;
}

export default function RecentOrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border-b">Order ID</th>
            <th className="p-3 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id} className="hover:bg-gray-50 transition">
              <td className="p-3 border-b">{order._id}</td>
              <td className="p-3 border-b capitalize">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
