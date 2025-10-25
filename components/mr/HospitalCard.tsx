// src/components/mr/HospitalCard.tsx
"use client";
import React from "react";
import { MapPin, Phone, Mail, Building2 } from "lucide-react";

type Props = {
  hospital: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    approved?: boolean;
  };
};

export default function HospitalCard({ hospital }: Props) {
  const statusColor = hospital.approved
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Header Gradient Strip */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500"></div>

      <div className="p-5 space-y-3">
        {/* Name and Status */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-500" />
            {hospital.name}
          </h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor}`}>
            {hospital.approved ? "Approved" : "Pending"}
          </span>
        </div>

        {/* City */}
        {hospital.city && (
          <div className="flex items-center text-slate-600 text-sm gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400" />
            {hospital.city}
          </div>
        )}

        {/* Contact Info */}
        <div className="flex flex-col gap-1.5 text-sm text-slate-700 mt-2">
          {hospital.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{hospital.phone}</span>
            </div>
          )}
          {hospital.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{hospital.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
}