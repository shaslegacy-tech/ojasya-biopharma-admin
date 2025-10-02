'use client';
import React from 'react';

interface Notification {
  id: string;
  message: string;
  time: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  title?: string;
}

export default function NotificationPanel({ title = 'Notifications', notifications }: NotificationPanelProps) {
  return (
    <div className="p-6 rounded-2xl shadow-lg bg-white/10 backdrop-blur-md">
      <p className="text-black font-bold mb-4">{title}</p>
      <ul className="space-y-3 max-h-64 overflow-y-auto">
        {notifications.map(n => (
          <li key={n.id} className="bg-white/20 p-3 rounded-lg hover:bg-white/30 transition relative">
            <span className="absolute top-2 right-2 inline-flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <p className="text-black font-medium">{n.message}</p>
            <p className="text-black/70 text-sm">{n.time}</p>
          </li>
        ))}
      </ul>
    </div>

  );
}
