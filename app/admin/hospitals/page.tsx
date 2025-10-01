"use client";
import { useState, useEffect } from "react";
import { Toast } from "@/components/ui/Toast";
import { Hospital } from "@/types/hospital";
import {
  CheckCircle,
  XCircle,
  Trash,
  Search,
  PlusCircle,
} from "lucide-react";
import { BrandButton } from "@/components/ui/BrandButton";
import HospitalForm, { HospitalFormData } from "@/components/HospitalForm";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error";
}

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<HospitalFormData | null>(null);

  useEffect(() => {
    refreshHospitals();
  }, []);

  const refreshHospitals = async () => {
    const res = await fetch("/api/hospital");
    const data = await res.json();
    setHospitals(data);
  };

  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const approve = async (id: string) => {
    await fetch(`/api/hospital/${id}/approve`, { method: "PUT" });
    await refreshHospitals();
    showToast("Hospital approved successfully!", "success");
  };

  const approveAll = async () => {
    const pendingIds = hospitals.filter((h) => !h.approved).map((h) => h._id);
    await Promise.all(
      pendingIds.map((id) =>
        fetch(`/api/hospital/${id}/approve`, { method: "PUT" })
      )
    );
    await refreshHospitals();
    showToast("All pending hospitals approved!", "success");
  };

  const deleteHospital = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return;
    await fetch(`/api/hospital/${id}`, { method: "DELETE" });
    await refreshHospitals();
    showToast("Hospital deleted!", "error");
  };

  const handleSubmit = async (data: HospitalFormData) => {
    const method = data._id ? "PUT" : "POST";
    const url = data._id ? `/api/hospital/${data._id}` : "/api/hospital";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    setSelected(null);
    await refreshHospitals();
    showToast("Hospital saved successfully!", "success");
  };

  const handleEdit = (hospital: Hospital) => {
    setSelected(hospital);
    setShowForm(true);
  };

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 relative">
      <h2 className="text-3xl font-bold mb-6 text-[#0f4c75]">Hospitals</h2>

      {/* Toasts */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            message={t.message}
            type={t.type}
            onClose={removeToast}
          />
        ))}
      </div>

      {/* Top actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 max-w-sm w-full relative">
          <Search className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bfa6]"
          />
        </div>

        <div className="flex gap-2">
          <BrandButton
            size="md"
            variant="indigo"
            onClick={approveAll}
            className="flex items-center gap-2 bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] text-white hover:scale-105 transition-transform"
          >
            <CheckCircle size={16} /> Approve All Pending
          </BrandButton>
          <BrandButton
            size="md"
            variant="indigo"
            onClick={() => {
              setSelected(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#00bfa6] via-[#0072ff] to-[#00ff9d] text-white hover:scale-105 transition-transform"
          >
            <PlusCircle size={16} /> Add Hospital
          </BrandButton>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-xl shadow-lg bg-white">
          <thead className="bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                Email
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredHospitals.map((h) => (
              <tr
                key={h._id}
                className="transition-transform transform hover:scale-[1.01] cursor-pointer"
                onClick={() => handleEdit(h)} // 🔹 Row click → edit
              >
                <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                  {h.name}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {h.email}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  {h.approved ? (
                    <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                      <CheckCircle size={18} /> Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                      <XCircle size={18} /> Pending
                    </span>
                  )}
                </td>
                <td
                  className="px-6 py-4 text-center whitespace-nowrap flex justify-center items-center gap-2"
                  onClick={(e) => e.stopPropagation()} // ✅ Prevent row click here
                >
                  {!h.approved && (
                    <BrandButton
                      size="sm"
                      variant="indigo"
                      className="flex items-center gap-1 bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] text-white hover:scale-105 transition-transform"
                      onClick={() => approve(h._id)}
                    >
                      <CheckCircle size={16} /> Approve
                    </BrandButton>
                  )}
                  <BrandButton
                    size="sm"
                    variant="red"
                    className="flex items-center gap-1 hover:scale-105 transition-transform"
                    onClick={() => deleteHospital(h._id)}
                  >
                    <Trash size={16} /> Delete
                  </BrandButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredHospitals.map((h) => (
          <div
            key={h._id}
            className="bg-white shadow-lg rounded-xl p-4 flex flex-col gap-2 border border-gray-100 cursor-pointer"
            onClick={() => handleEdit(h)} // 🔹 Card click → edit
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">{h.name}</h3>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  h.approved ? "text-green-600" : "text-red-500"
                }`}
              >
                {h.approved ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {h.approved ? "Approved" : "Pending"}
              </span>
            </div>
            <p className="text-gray-600">{h.email}</p>
            <div
              className="flex gap-2 mt-2"
              onClick={(e) => e.stopPropagation()} // ✅ Prevent card click here
            >
              {!h.approved && (
                <BrandButton
                  size="sm"
                  variant="indigo"
                  className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-[#0072ff] via-[#00bfa6] to-[#00ff9d] text-white hover:scale-105 transition-transform"
                  onClick={() => approve(h._id)}
                >
                  <CheckCircle size={16} /> Approve
                </BrandButton>
              )}
              <BrandButton
                size="sm"
                variant="red"
                className="flex-1 flex items-center justify-center gap-1 hover:scale-105 transition-transform"
                onClick={() => deleteHospital(h._id)}
              >
                <Trash size={16} /> Delete
              </BrandButton>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {selected ? "Edit Hospital" : "Add Hospital"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <HospitalForm
              role="admin"
              initialData={selected || undefined}
              onSubmit={handleSubmit}
              onDelete={deleteHospital}
            />
          </div>
        </div>
      )}
    </div>
  );
}
