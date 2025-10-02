'use client';
import React, { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { IProduct, IUser, IInventory, IOrderProduct } from "@/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
} from "recharts";
import { Bell, Info } from "lucide-react";
import CountUp from "react-countup";
import { Tooltip } from "@/components/ui/Tooltip";
import PremiumSelect from "@/components/ui/PremiumSelect";
import PremiumFileUpload from "@/components/ui/PremiumFileUpload";

const HospitalOrderPage: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [suppliers, setSuppliers] = useState<IUser[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [orderProducts, setOrderProducts] = useState<IOrderProduct[]>([]);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [inventory, setInventory] = useState<IInventory[]>([]);
  const [notifications, setNotifications] = useState<string[]>([
    "New supplier added",
    "Stock updated for Paracetamol",
    "Order #102 pending approval"
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, supRes, invRes] = await Promise.all([
          api.get<IProduct[]>("/products"),
          api.get<IUser[]>("/users?role=supplier"),
          api.get<IInventory[]>("/inventory"),
        ]);
        setProducts(prodRes.data);
        setSuppliers(supRes.data);
        setInventory(invRes.data);
      } catch {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  const addProduct = (productId: string) => {
    if (orderProducts.find((p) => p.productId._id === productId)) return;
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    setOrderProducts([...orderProducts, { productId: product, quantity: 1, price: 0 }]);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...orderProducts];
    updated[index].quantity = qty;
    setOrderProducts(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...orderProducts];
    updated[index].price = price;
    setOrderProducts(updated);
  };

  const validateStock = () => {
    for (const p of orderProducts) {
      const stockItem = inventory.find(
        (i) => i.productId._id === p.productId._id && i.supplierId._id === selectedSupplier
      );
      if (!stockItem || stockItem.stock < p.quantity) {
        toast.error(`Insufficient stock for ${p.productId.name}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedSupplier || orderProducts.length === 0) {
      toast.error("Supplier & products are required");
      return;
    }
    if (!validateStock()) return;

    const totalPrice = orderProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const formData = new FormData();
    formData.append("supplierId", selectedSupplier);
    formData.append("totalPrice", totalPrice.toString());
    formData.append(
      "products",
      JSON.stringify(
        orderProducts.map((p) => ({
          productId: p.productId._id,
          quantity: p.quantity,
          price: p.price,
        }))
      )
    );
    if (prescriptionFile) formData.append("prescriptionFile", prescriptionFile);

    try {
      await api.post("/orders", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Order created successfully");
      setOrderProducts([]);
      setSelectedSupplier("");
      setPrescriptionFile(null);
    } catch {
      toast.error("Failed to create order");
    }
  };

  // Summary Metrics
  const totalQuantity = useMemo(() => orderProducts.reduce((sum, p) => sum + p.quantity, 0), [orderProducts]);
  const totalPrice = useMemo(() => orderProducts.reduce((sum, p) => sum + p.quantity * p.price, 0), [orderProducts]);

  // Chart Data
  const chartData = useMemo(() => 
    orderProducts.map(p => ({
      name: p.productId.name,
      Quantity: p.quantity
    }))
  , [orderProducts]);

  return (
    <div className="p-6 space-y-6 relative font-sans">

      {/* Page Title and Notification */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-black bg-clip-text text-transparent bg-gradient-to-r from-[#0daba9] to-[#78cfce]">
          Create Hospital Order
        </h2>
        <div className="relative cursor-pointer group">
          <Bell className="w-6 h-6 text-[#0daba9]" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
          <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <h4 className="font-semibold text-black mb-2">Notifications</h4>
            <ul className="space-y-1 text-black text-sm">
              {notifications.map((n, i) => <li key={i}>• {n}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Summary Metrics with Animated Numbers & Tooltips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Total Products',
            value: orderProducts.length,
            gradient: 'from-[#0daba9] to-[#78cfce]',
            tooltip: 'Number of different products added to the order'
          },
          {
            title: 'Total Quantity',
            value: totalQuantity,
            gradient: 'from-[#0daba9]/70 to-[#78cfce]/70',
            tooltip: 'Sum of quantities for all products'
          },
          {
            title: 'Total Price',
            value: totalPrice,
            gradient: 'from-[#0daba9]/50 to-[#78cfce]/50',
            tooltip: 'Total order price calculated from quantity × price'
          }
        ].map((card) => (
          <Tooltip key={card.title} content={card.tooltip}>
            <div className={`bg-gradient-to-r ${card.gradient} shadow-2xl rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition cursor-pointer`}>
              <div className="flex items-center gap-1">
                <span className="text-gray-200 text-sm">{card.title}</span>
                <Info className="w-4 h-4 text-gray-300"/>
              </div>
              <span className="text-2xl font-bold text-black">
                <CountUp end={card.value} duration={1.5} />
              </span>
            </div>
          </Tooltip>
        ))}
      </div>

      {/* Supplier & Product Selection */}
      <div className="bg-white shadow-2xl rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <PremiumSelect
            label="Supplier"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            options={suppliers.map((s) => ({ value: s._id, label: s.name }))}
          />
        </div>


        <div className="space-y-3">
          <PremiumSelect
            label="Product"
            onChange={(e) => addProduct(e.target.value)}
            options={products.map((p) => ({ value: p._id, label: p.name }))}
          />
        </div>
      </div>

      {/* Prescription Upload */}
      <div className="bg-white shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center">
          <PremiumFileUpload
          label="Prescription File"
          file={prescriptionFile}
          onChange={(f) => setPrescriptionFile(f)}
        />
      </div>

      {/* Product Quantity Chart */}
      {orderProducts.length > 0 && (
        <div className="bg-white shadow-2xl rounded-2xl p-6">
          <h3 className="font-medium text-black mb-4">Product Quantities</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: '#000' }} />
              <YAxis tick={{ fill: '#000' }} />
              <ChartTooltip />
              <Bar dataKey="Quantity" fill="#0daba9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-[#0daba9] to-[#78cfce] text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition"
        >
          Submit Order
        </button>
      </div>
    </div>
  );
};

export default HospitalOrderPage;
