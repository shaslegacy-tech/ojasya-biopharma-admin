'use client';
import React from 'react';
import CountUp from 'react-countup';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
}

export default function StatsCard({ title, value, icon, gradient }: StatsCardProps) {
  return (
    <div
      className={`flex items-center p-6 rounded-2xl shadow-lg bg-gradient-to-r ${gradient} hover:scale-105 transition transform`}
    >
      <div className="p-4 rounded-full bg-white/20 text-white">
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-white font-semibold">{title}</p>
        <p className="text-2xl font-bold text-white">
          {typeof value === 'number' ? <CountUp end={value} duration={1.5} /> : value}
        </p>
      </div>
    </div>
  );
}
