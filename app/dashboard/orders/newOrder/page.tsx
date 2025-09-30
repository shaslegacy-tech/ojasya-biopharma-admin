// frontend/app/dashboard/orders/new/page.tsx
'use client';
import { useState } from 'react';
import api from '@/lib/api';

export default function NewOrder() {
  const [file, setFile] = useState<File | null>(null);
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = async () => {
    if (!file) return alert('Upload prescription file');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('brand', brand);
    formData.append('quantity', quantity.toString());

    try {
      await api.post('/hospital/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Order placed successfully!');
    } catch (err: unknown) {
      let message = 'Order failed';
      if (err && typeof err === 'object') {
        const maybeResponse = (err as { response?: { data?: { message?: string } } }).response;
        message = maybeResponse?.data?.message ?? message;
      }
      alert(message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Place New Order</h2>
      <input type="text" placeholder="Brand" value={brand} onChange={e=>setBrand(e.target.value)} className="w-full p-2 mb-4 border rounded" />
      <input type="number" placeholder="Quantity" value={quantity} onChange={e=>setQuantity(Number(e.target.value))} className="w-full p-2 mb-4 border rounded" />
      <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="mb-4" />
      <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Place Order</button>
    </div>
  );
}
