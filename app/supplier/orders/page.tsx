"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { IOrder, OrderStatus } from "@/types";

const SupplierOrderPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const fetchOrders = async () => {
    try {
      const res = await api.get<IOrder[]>("/orders");
      setOrders(res.data);
    } catch {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.put(`/orders/${id}`, { status });
      toast.success("Status updated");
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(
    (o) => statusFilter === "all" || o.status === statusFilter
  );

  const darkGradient = "linear-gradient(90deg, #0daba9, #178d8d, #1f95007a)";

  return (
    <div className="p-4">
      {/* Heading */}
      <h2
        className="text-xl font-bold mb-4 text-transparent bg-clip-text"
        style={{ backgroundImage: darkGradient }}
      >
        Supplier Orders
      </h2>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="font-medium text-gray-700 text-sm">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as OrderStatus | "all")
          }
          className="text-sm px-3 py-1 rounded shadow-sm text-white focus:outline-none transition-all duration-300"
          style={{ backgroundImage: darkGradient }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Table with custom scrollbar */}
      <div
        className="overflow-x-auto shadow rounded-lg border border-gray-200 max-h-[500px] custom-scrollbar"
        style={{ scrollbarWidth: "thin" }}
      >
        <table
          className="min-w-full bg-white text-sm table-fixed border-separate"
          style={{ borderSpacing: "0 4px" }}
        >
          <thead
            className="text-white sticky top-0 z-10"
            style={{
              backgroundImage: darkGradient,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2 text-left font-semibold rounded-tl-md">
                Hospital
              </th>
              <th className="px-4 py-2 text-left font-semibold">Products</th>
              <th className="px-4 py-2 text-left font-semibold">Total</th>
              <th className="px-4 py-2 text-left font-semibold">Status</th>
              <th className="px-4 py-2 text-left font-semibold">Prescription</th>
              <th className="px-4 py-2 text-center font-semibold rounded-tr-md">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, idx) => (
                <tr
                  key={order._id}
                  className="rounded-md transition-transform transform hover:scale-[1.01] hover:shadow-lg hover:shimmer-row"
                  style={{
                    background:
                      idx % 2 === 0
                        ? "linear-gradient(to right, #0daba9 / 5%, #178d8d / 2%)"
                        : "linear-gradient(to right, #178d8d / 5%, #0daba9 / 2%)",
                    borderRadius: "6px",
                    marginBottom: "4px",
                  }}
                >
                  <td className="px-4 py-2 rounded-l-md">{order.hospitalId.name}</td>
                  <td className="px-4 py-2">
                    {order.products
                      .map((p) => `${p.productId.name} (${p.quantity})`)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-2 font-medium">{order.totalPrice}</td>
                  <td className="px-4 py-2 capitalize">
                    <span
                      className="px-2 py-0.5 rounded-full text-white text-xs font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#0daba9]/40"
                      style={{ backgroundImage: darkGradient }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {order.prescriptionFileUrl ? (
                      <a
                        href={order.prescriptionFileUrl}
                        target="_blank"
                        className="text-xs font-medium text-transparent bg-clip-text transition-all duration-300 hover:scale-105 hover:brightness-125"
                        style={{ backgroundImage: darkGradient }}
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2 flex justify-center gap-1 rounded-r-md">
                    {order.status === "pending" && (
                      <button
                        onClick={() => updateStatus(order._id, "accepted")}
                        className="px-2 py-1 rounded text-white text-xs shadow transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#0daba9]/40"
                        style={{ backgroundImage: darkGradient }}
                      >
                        Accept
                      </button>
                    )}
                    {order.status === "accepted" && (
                      <button
                        onClick={() => updateStatus(order._id, "delivered")}
                        className="px-2 py-1 rounded text-white text-xs shadow transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#0daba9]/40"
                        style={{ backgroundImage: darkGradient }}
                      >
                        Deliver
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  <div className="relative inline-block px-6 py-3 rounded text-sm font-semibold text-white shimmer-bg">
                    No orders found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Scrollbar & Shimmer Styles */}
      <style jsx>{`
        /* Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #0daba9, #178d8d, #1f95007a);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #178d8d, #0daba9, #1f95007a);
        }

        /* Shimmer effect for "No orders found" */
        .shimmer-bg {
          background: linear-gradient(
            90deg,
            #0daba9 0%,
            #178d8d 25%,
            #1f95007a 50%,
            #178d8d 75%,
            #0daba9 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2.5s linear infinite;
        }

        /* Gradient shimmer for row hover */
        .hover\\:shimmer-row:hover {
          background: linear-gradient(
            90deg,
            rgba(13, 186, 169, 0.15),
            rgba(23, 141, 141, 0.15),
            rgba(31, 149, 7, 0.15)
          );
          transition: background 0.5s ease;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SupplierOrderPage;
