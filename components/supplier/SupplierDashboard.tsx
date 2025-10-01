// components/supplier/DashboardCards.tsx
"use client";
import { Package, FileText, Users, BarChart2 } from "lucide-react";

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
}

export default function DashboardCards({ data }: { data: CardProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`bg-gradient-to-r ${card.gradient} p-6 rounded-2xl shadow-lg transform transition-all hover:scale-105 hover:shadow-2xl`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{card.title}</h3>
              <Icon className="w-8 h-8 text-white opacity-90" />
            </div>
            <p className="mt-4 text-white text-3xl font-extrabold">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
