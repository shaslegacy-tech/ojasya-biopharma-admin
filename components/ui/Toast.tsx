'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error';
  onClose: (id: string) => void;
}

export const Toast = ({ id, message, type, onClose }: ToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const bgGradient =
    type === 'success'
      ? 'bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d]'
      : 'bg-gradient-to-r from-[#ff416c] via-[#ff4b2b] to-[#ff6f3c]';

  const icon = type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />;

  return (
    <div
      className={`flex items-center justify-between gap-2 text-white px-4 py-3 rounded-lg shadow-lg transition-all transform ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
      } ${bgGradient}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{message}</span>
      </div>
      <button onClick={() => onClose(id)} className="hover:opacity-80">
        <X size={16} />
      </button>
    </div>
  );
};
