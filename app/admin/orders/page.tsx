'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { IOrder, OrderStatus, IProductOrder } from '@/types';
import { Toast } from '@/components/ui/Toast';
import { FileText } from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const AdminOrderPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [popOrders, setPopOrders] = useState<Record<string, boolean>>({});

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get<IOrder[]>('/admin/orders');
      setOrders(res.data);
      const newPop: Record<string, boolean> = {};
      res.data.forEach((o) => (newPop[o._id] = true));
      setPopOrders(newPop);
      setTimeout(() => setPopOrders({}), 300);
    } catch (err: unknown) {
      console.error('Fetch orders error:', err);
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      else
        // @ts-expect-error: response may exist on Axios error object
        message = err.response?.data?.message || JSON.stringify(err);
      addToast(`Failed to load orders: ${message}`, 'error');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.put(`/orders/${id}`, { status });
      addToast('Status updated successfully!', 'success');
      fetchOrders();
    } catch (err: unknown) {
      console.error('Update order error:', err);
      let message = 'Unknown error';
      if (err instanceof Error) message = err.message;
      else
        // @ts-expect-error: response may exist on Axios error object
        message = err.response?.data?.message || JSON.stringify(err);
      addToast(`Failed to update status: ${message}`, 'error');
    }
  };

  const filteredOrders = orders.filter(
    (o) => statusFilter === 'all' || o.status === statusFilter
  );

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  const statusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-[#0f4c75]">Admin Orders</h2>

      {/* Toasts */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} id={t.id} message={t.message} type={t.type} onClose={removeToast} />
        ))}
      </div>

      {/* Filter & Revenue */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="font-medium">Status Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bfa6]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <div className="text-lg font-semibold text-[#0072ff]">
          Total Revenue: <span className="text-green-600">${totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-xl shadow-lg bg-white">
          <thead className="bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Hospital</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Supplier</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Products</th>
              <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide">Total Price</th>
              <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide">Prescription</th>
              <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order, idx) => (
              <tr
                key={order._id}
                className={`transition-transform transform hover:scale-[1.01] ${
                  idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } shadow-sm`}
              >
                <td className="px-6 py-4 font-medium text-gray-800">{order.hospitalId.name}</td>
                <td className="px-6 py-4 text-gray-600">{order.supplierId.name}</td>
                <td className="px-6 py-4 text-gray-700">
                  {order.products.map((p: IProductOrder) => `${p.productId.name} (${p.quantity})`).join(', ')}
                </td>
                <td className="px-6 py-4 text-center font-semibold">${order.totalPrice.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium transition-transform duration-300 ${
                      statusColor(order.status)
                    } ${popOrders[order._id] ? 'scale-125 animate-bounce' : 'scale-100'}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {order.prescriptionFileUrl ? (
                    <a
                      href={order.prescriptionFileUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[#0072ff] hover:underline"
                    >
                      <FileText size={16} /> View
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 text-center flex justify-center gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(order._id, 'accepted')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(order._id, 'delivered')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105"
                      >
                        Deliver
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card Layout */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="relative p-4 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02]"
          >
            {/* Gradient border glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] rounded-xl blur opacity-40 hover:opacity-70 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-[#0f4c75]">{order.hospitalId.name}</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium transition-transform duration-300 ${
                    statusColor(order.status)
                  } ${popOrders[order._id] ? 'scale-125 animate-bounce' : 'scale-100'}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600">
                <span className="font-semibold">Supplier:</span> {order.supplierId.name}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Products:</span>{' '}
                {order.products.map((p: IProductOrder) => `${p.productId.name} (${p.quantity})`).join(', ')}
              </p>
              <p className="text-gray-800 font-semibold">Total: ${order.totalPrice.toFixed(2)}</p>
              <div className="flex items-center justify-between mt-2">
                {order.prescriptionFileUrl ? (
                  <a
                    href={order.prescriptionFileUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[#0072ff] hover:underline"
                  >
                    <FileText size={16} /> View Prescription
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm">No Prescription</span>
                )}
                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(order._id, 'accepted')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(order._id, 'delivered')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105"
                      >
                        Deliver
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <p className="text-center text-gray-500">No orders found.</p>
        )}
      </div>

    </div>
  );
};

export default AdminOrderPage;
