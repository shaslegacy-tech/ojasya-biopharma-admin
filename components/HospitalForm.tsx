"use client";

import { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

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
    }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (form._id && onDelete) {
      if (confirm("Are you sure you want to delete this hospital?")) {
        await onDelete(form._id);
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <div className="grid grid-cols-2 gap-6">
        <Input
          name="name"
          placeholder="Hospital Name"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <Input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <Input
          name="contactPerson"
          placeholder="Contact Person"
          value={form.contactPerson}
          onChange={handleChange}
        />

        <div className="col-span-2">
          <Textarea
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <Input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
        />
        <Input
          name="zip"
          placeholder="ZIP Code"
          value={form.zip}
          onChange={handleChange}
        />

        <select
          name="state"
          value={form.state}
          onChange={handleChange}
          className="border rounded-lg p-3"
        >
          <option value="">Select State</option>
          {STATES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        <select
          name="country"
          value={form.country}
          onChange={handleChange}
          className="border rounded-lg p-3"
        >
          <option value="">Select Country</option>
          {COUNTRIES.map((ct) => (
            <option key={ct} value={ct}>
              {ct}
            </option>
          ))}
        </select>

        <Input
          name="dlNumber"
          placeholder="Drug License Number"
          value={form.dlNumber}
          onChange={handleChange}
        />
        <Input
          name="gstNumber"
          placeholder="GST Number"
          value={form.gstNumber}
          onChange={handleChange}
        />
      </div>

      <div className="mt-6 flex justify-between">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
        {role === "admin" && form._id && onDelete && (
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
