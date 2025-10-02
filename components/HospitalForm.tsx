'use client';

import { useState, ChangeEvent, FormEvent } from "react";

export interface HospitalFormData {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  contactPerson: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  dlNumber: string;
  gstNumber: string;
  logo?: string;
}

interface HospitalFormProps {
  initialData?: HospitalFormData;
  role: "admin" | "hospital";
  onSubmit: (data: HospitalFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const STATES = ["Maharashtra", "Gujarat", "Karnataka", "Delhi", "Tamil Nadu"];
const COUNTRIES = ["India", "USA", "UK", "Germany", "Singapore"];

export default function HospitalForm({
  initialData,
  role,
  onSubmit,
  onDelete,
}: HospitalFormProps) {
  const [form, setForm] = useState<HospitalFormData>(
    initialData || {
      name: "",
      email: "",
      phone: "",
      contactPerson: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      dlNumber: "",
      gstNumber: "",
      logo: "",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Simple live validation
    if (!value) setErrors(prev => ({ ...prev, [name]: `${name} is required` }));
    else setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
      setForm(prev => ({ ...prev, logo: file.name }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let hasError = false;
    const newErrors: Record<string, string> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value) {
        hasError = true;
        newErrors[key] = `${key} is required`;
      }
    });
    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (form._id && onDelete && confirm("Are you sure you want to delete this hospital?")) {
      await onDelete(form._id);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8"
    >
      {/* Form Title */}
      <h2 className="text-3xl font-extrabold text-black mb-6">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0daba9] to-[#78cfce]">
          Hospital Profile
        </span>
      </h2>

      {/* Logo Upload */}
      <div className="flex items-center gap-6">
        <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-lg transition-all duration-500">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Hospital Logo"
              className="w-full h-full object-cover transition-all duration-500"
            />
          ) : (
            <span className="text-black font-bold text-xl">Logo</span>
          )}
        </div>
        <label className="cursor-pointer bg-gradient-to-r from-[#0daba9] to-[#78cfce] text-black font-bold px-5 py-3 rounded-xl shadow hover:scale-105 transition">
          Upload Logo
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { name: "name", label: "Hospital Name", tooltip: "Enter full hospital name" },
          { name: "email", label: "Email", tooltip: "Hospital official email" },
          { name: "phone", label: "Phone", tooltip: "Contact number" },
          { name: "contactPerson", label: "Contact Person", tooltip: "Name of primary contact" },
          { name: "city", label: "City", tooltip: "City location" },
          { name: "zip", label: "ZIP Code", tooltip: "Postal/ZIP code" },
          { name: "dlNumber", label: "Drug License Number", tooltip: "Official DL number" },
          { name: "gstNumber", label: "GST Number", tooltip: "GST registration number" },
        ].map((field) => (
          <div key={field.name} className="relative w-full">
            <input
              type="text"
              name={field.name}
              value={form[field.name as keyof HospitalFormData] as string}
              onChange={handleChange}
              placeholder=" "
              title={field.tooltip}
              className={`peer w-full p-4 h-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0daba9] focus:outline-none transition text-black text-sm ${
                errors[field.name] ? "border-red-500" : ""
              }`}
            />
            <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#0daba9]">
              {field.label}
            </label>
            {errors[field.name] && (
              <span className="text-red-500 text-xs mt-1 block">{errors[field.name]}</span>
            )}
          </div>
        ))}

        {/* Address */}
        <div className="relative col-span-1 md:col-span-2">
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder=" "
            title="Hospital address"
            className={`peer w-full p-4 h-24 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0daba9] resize-none focus:outline-none transition text-black text-sm ${
              errors.address ? "border-red-500" : ""
            }`}
          />
          <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#0daba9]">
            Address
          </label>
          {errors.address && (
            <span className="text-red-500 text-xs mt-1 block">{errors.address}</span>
          )}
        </div>

        {/* Select Fields */}
        <div className="relative">
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            title="Select state"
            className={`peer w-full p-4 h-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0daba9] bg-white text-black text-sm ${
              errors.state ? "border-red-500" : ""
            }`}
          >
            <option value="">Select State</option>
            {STATES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          {errors.state && (
            <span className="text-red-500 text-xs mt-1 block">{errors.state}</span>
          )}
        </div>

        <div className="relative">
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            title="Select country"
            className={`peer w-full p-4 h-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0daba9] bg-white text-black text-sm ${
              errors.country ? "border-red-500" : ""
            }`}
          >
            <option value="">Select Country</option>
            {COUNTRIES.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
          {errors.country && (
            <span className="text-red-500 text-xs mt-1 block">{errors.country}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#0daba9] to-[#78cfce] text-black font-bold px-6 py-3 rounded-xl shadow hover:scale-105 transition text-sm"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>

        {role === "admin" && form._id && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow transition text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
