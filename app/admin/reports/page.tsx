"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import CountUp from "react-countup";
import { IOrder, IInventory, OrderStatus } from "@/types";
import { CSVLink } from "react-csv";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminReportsPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [inventory, setInventory] = useState<IInventory[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const [ordersRes, inventoryRes] = await Promise.all([
        api.get<IOrder[]>("/orders"),
        api.get<IInventory[]>("/inventory/low-stock"),
      ]);
      setOrders(ordersRes.data);
      setInventory(inventoryRes.data);
    } catch {
      toast.error("Failed to fetch reports");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesSearch =
      o.hospitalId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.supplierId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.products.some(p => p.productId.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = filteredOrders.length;

  // CSV Data
  const csvData = filteredOrders.map(o => ({
    Hospital: o.hospitalId.name,
    Supplier: o.supplierId.name,
    Products: o.products.map(p => `${p.productId.name} (${p.quantity})`).join(", "),
    TotalPrice: o.totalPrice,
    Status: o.status,
  }));

  // PDF Export
  const generatePDF = () => {
  const doc = new jsPDF();
  doc.text("Admin Report", 14, 20);

  doc.autoTable({
    head: [["Hospital", "Supplier", "Products", "Total Price", "Status"]],
    body: filteredOrders.map(o => [
      o.hospitalId.name,
      o.supplierId.name,
      o.products.map(p => `${p.productId.name} (${p.quantity})`).join(", "),
      o.totalPrice,
      o.status.toUpperCase(),
    ]),
    startY: 30,
  });

  doc.save("admin-report.pdf");
};

  // Revenue & Order Chart Data
  const revenueChartData = {
    labels: filteredOrders.map(o => o.hospitalId.name),
    datasets: [{ label:"Revenue", data: filteredOrders.map(o => o.totalPrice), backgroundColor:'rgba(0,191,166,0.6)' }]
  };
  const statusPieData = {
    labels: ["Pending","Accepted","Delivered"],
    datasets:[{
      data: [
        filteredOrders.filter(o => o.status==="pending").length,
        filteredOrders.filter(o => o.status==="accepted").length,
        filteredOrders.filter(o => o.status==="delivered").length
      ],
      backgroundColor:["#facc15","#3b82f6","#16a34a"]
    }]
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-[#0f4c75] mb-6 animate-fade-in">Admin Reports</h2>

      {/* Sticky Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 sticky top-4 z-10 bg-white pt-4">
        {[
          { label: "Total Orders", value: totalOrders, gradient: "from-[#0072ff] via-[#00bfa6] to-[#00ff9d]" },
          { label: "Total Revenue", value: totalRevenue, gradient: "from-[#ff416c] via-[#ff4b2b] to-[#ff6a00]" },
          { label: "Low Stock Items", value: inventory.length, gradient: "from-[#ffafbd] via-[#ffc3a0] to-[#ffafbd]" },
          { label: "Filtered Orders", value: filteredOrders.length, gradient: "from-[#36d1dc] via-[#5b86e5] to-[#36d1dc]" },
        ].map((card) => (
          <div key={card.label} className={`bg-gradient-to-r ${card.gradient} text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between transform hover:scale-105 hover:shadow-xl animate-float transition`}>
            <h3 className="text-lg font-semibold">{card.label}</h3>
            <span className="text-3xl font-bold">
              <CountUp end={card.value as number} duration={1.5} separator="," />
            </span>
          </div>
        ))}
      </div>

      {/* Filters & Export */}
      <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap mb-6">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as OrderStatus | "all")}
          className="border border-gray-300 rounded-xl px-4 py-2 backdrop-blur-sm bg-white/40 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00bfa6] text-gray-800 font-semibold transition duration-300 hover:scale-105"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="delivered">Delivered</option>
        </select>

        <input
          type="text"
          placeholder="Search hospital, supplier, or product..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 flex-1 min-w-[200px] md:min-w-[300px] backdrop-blur-sm bg-white/40 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00bfa6] text-gray-800 font-semibold transition duration-300 hover:scale-105"
        />

        <div className="flex flex-wrap gap-2">
          <CSVLink
            data={csvData}
            filename={"admin-report.csv"}
            className="bg-green-500 text-white px-4 py-2 rounded-xl shadow hover:scale-105 transition"
          >
            Export CSV
          </CSVLink>

          <button
            onClick={generatePDF}
            className="bg-red-500 text-white px-4 py-2 rounded-xl shadow hover:scale-105 transition"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#ff4b2b] mb-3">Low Stock Alerts</h3>
        {inventory.length===0?(
          <p className="text-gray-500 italic bg-gray-100 p-3 rounded-2xl shadow-inner text-sm">All inventory levels are healthy ✅</p>
        ):(
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map(i=>(
              <div key={i._id} className="bg-white rounded-2xl shadow-md p-4 border-l-4 border-red-500 hover:shadow-xl transition-shadow animate-float animate-pulse-glow">
                <p className="font-semibold text-[#ff4b2b]">{i.productId.name}</p>
                <p className="text-sm">Stock: <span className={i.stock<i.threshold?"text-red-600 font-bold":""}>{i.stock}</span> / Threshold: {i.threshold}</p>
                <p className="text-xs text-gray-500 mt-1">⚠️ Consider replenishing soon to avoid shortages.</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h3 className="font-semibold text-[#0f4c75] mb-4">Revenue Chart</h3>
          <Bar data={revenueChartData} options={{responsive:true, plugins:{legend:{display:false}}}}/>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h3 className="font-semibold text-[#0f4c75] mb-4">Order Status Distribution</h3>
          <Pie data={statusPieData} options={{responsive:true, plugins:{legend:{position:"bottom"}}}}/>
        </div>
      </div>

     {/* Desktop Orders Table */}
<div className="hidden lg:block overflow-x-auto">
  <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden shadow-lg">
    <thead className="bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] text-white">
      <tr>
        <th className="px-4 py-3 text-left">Hospital</th>
        <th className="px-4 py-3 text-left">Supplier</th>
        <th className="px-4 py-3 text-left">Products</th>
        <th className="px-4 py-3 text-center">Total Price</th>
        <th className="px-4 py-3 text-center">Status</th>
      </tr>
    </thead>
    <tbody>
      {filteredOrders.map(o => (
        <tr
          key={o._id}
          className="text-center border-b transition-all duration-300 hover:shadow-lg hover:scale-[1.01] hover:bg-gradient-to-r hover:from-[#e0f7fa] hover:to-[#e0f2f1]"
        >
          <td className="px-4 py-2 text-left">{o.hospitalId.name}</td>
          <td className="px-4 py-2 text-left">{o.supplierId.name}</td>
          <td className="px-4 py-2 text-left">{o.products.map(p => `${p.productId.name} (${p.quantity})`).join(", ")}</td>
          <td className="px-4 py-2 font-semibold">₹{o.totalPrice}</td>
          <td className="px-4 py-2">
            <span
              className={`px-3 py-1 rounded-full text-white inline-block animate-pulse ${
                o.status === "pending"
                  ? "bg-yellow-500"
                  : o.status === "accepted"
                  ? "bg-blue-500"
                  : "bg-green-500"
              }`}
            >
              {o.status.toUpperCase()}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Mobile Orders Cards */}
<div className="grid grid-cols-1 gap-4 lg:hidden">
  {filteredOrders.map(o => (
    <div
      key={o._id}
      className="bg-white rounded-2xl shadow-md p-4 border-l-4 border-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 animate-float"
    >
      <p className="font-semibold mb-1 text-[#0f4c75]">Hospital: {o.hospitalId.name}</p>
      <p className="mb-1">Supplier: {o.supplierId.name}</p>
      <p className="mb-1">Products: {o.products.map(p => `${p.productId.name} (${p.quantity})`).join(", ")}</p>
      <p className="mb-1 font-semibold">Total: ₹{o.totalPrice}</p>
      <p
        className={`font-semibold px-2 py-1 rounded-full text-white inline-block animate-pulse ${
          o.status === "pending"
            ? "bg-yellow-500"
            : o.status === "accepted"
            ? "bg-blue-500"
            : "bg-green-500"
        }`}
      >
        {o.status.toUpperCase()}
      </p>
    </div>
  ))}
</div>

    </div>
  );
};

export default AdminReportsPage;
