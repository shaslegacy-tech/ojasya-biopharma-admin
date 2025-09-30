"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface HospitalForm {
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

export default function HospitalProfilePage() {
  const [form, setForm] = useState<HospitalForm>({
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
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/hospitals/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setForm(data));
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch(`/api/hospitals/${form._id || ""}`, {
      method: form._id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      alert("Profile saved");
    } else {
      const err = await res.json();
      alert(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Hospital Profile</h2>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(form).map(([key, value]) => (
          key !== "_id" && (
            <Input
              key={key}
              name={key}
              placeholder={key}
              value={value}
              onChange={handleChange}
            />
          )
        ))}
      </div>
      <Button className="mt-4" onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
}
