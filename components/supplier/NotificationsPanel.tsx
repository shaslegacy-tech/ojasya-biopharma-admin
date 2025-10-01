// components/supplier/NotificationsPanel.tsx
"use client";

interface Notification {
  id: string;
  message: string;
  date: string;
}

export default function NotificationsPanel({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      <ul className="space-y-3 max-h-64 overflow-y-auto">
        {notifications.map(n => (
          <li key={n.id} className="border p-3 rounded-lg hover:bg-gray-50 transition">
            <p>{n.message}</p>
            <span className="text-gray-400 text-sm">{n.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
