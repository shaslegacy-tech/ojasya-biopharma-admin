'use client';
import React from 'react';

interface BadgeProps {
  status: 'pending' | 'delivered' | string;
}

export function Badge({ status }: BadgeProps) {
  const colors = {
    pending: 'bg-yellow-400 text-white',
    delivered: 'bg-green-500 text-white',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status as 'pending' | 'delivered'] || 'bg-gray-500 text-white'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
