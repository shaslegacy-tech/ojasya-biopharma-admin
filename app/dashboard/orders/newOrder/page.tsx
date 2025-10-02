'use client';
import { useState } from 'react';
import api from '@/lib/api';
import PremiumInput from '@/components/ui/PremiumInput';
import PremiumFileUpload from '@/components/ui/PremiumFileUpload';
import { toast } from 'react-hot-toast';

export default function NewOrder() {
  const [file, setFile] = useState<File | null>(null);
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!brand.trim()) return toast.error('Brand is required');
    if (quantity < 1) return toast.error('Quantity must be at least 1');
    if (!file) return toast.error('Upload prescription file');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('brand', brand);
    formData.append('quantity', quantity.toString());

    try {
      await api.post('/hospital/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Order placed successfully!');
      // reset form
      setBrand('');
      setQuantity(1);
      setFile(null);
    } catch (err: unknown) {
      let message = 'Order failed';
      if (err && typeof err === 'object') {
        const maybeResponse = (err as { response?: { data?: { message?: string } } }).response;
        message = maybeResponse?.data?.message ?? message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl space-y-6">
      <h2 className="text-2xl font-bold text-black bg-clip-text text-transparent bg-gradient-to-r from-[#0daba9] to-[#78cfce]">
        Place New Order
      </h2>

      <PremiumInput
        label="Brand"
        placeholder="Enter brand name"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
      />

      <PremiumInput
        label="Quantity"
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <PremiumFileUpload
        label="Prescription File"
        file={file}
        onChange={(f) => setFile(f)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#0daba9] to-[#78cfce] text-white py-3 rounded-2xl font-semibold hover:scale-105 transition disabled:opacity-60"
      >
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
}
