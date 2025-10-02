'use client';
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface ChartCardProps {
  title: string;
  data: { name: string; value: number }[];
  textColor?: string; // optional
}

export default function ChartCard({ title, data, textColor = 'black' }: ChartCardProps) {
  return (
    <div className="p-6 rounded-2xl shadow-lg bg-transparent backdrop-blur-md">
      <p className={`font-bold mb-4 ${textColor === 'black' ? 'text-black' : 'text-white'}`}>
        {title}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid stroke={textColor === 'black' ? '#00000033' : '#ffffff33'} strokeDasharray="5 5" />
          <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
          <YAxis tick={{ fill: textColor, fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#000' }}
            labelStyle={{ color: '#000' }}
            itemStyle={{ color: '#000' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={textColor === 'black' ? '#0daba9' : '#ffffff'}
            strokeWidth={3}
            dot={{ r: 4, fill: '#0daba9', stroke: textColor === 'black' ? '#000' : '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
