'use client';
import { useEffect, useState } from "react";
import HospitalForm, { HospitalFormData } from "@/components/HospitalForm";

export default function HospitalProfilePage() {
  const [hospital, setHospital] = useState<HospitalFormData | null>(null);

  useEffect(() => {
    fetch("/api/hospital/me")
      .then((res) => res.json())
      .then((data) => setHospital(data));
  }, []);

  const handleSubmit = async (data: HospitalFormData) => {
    const method = data._id ? "PUT" : "POST";
    await fetch(`/api/hospital/${data._id || ""}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    alert("Profile updated");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {hospital && (
        <div>
          <HospitalForm
            role="hospital"
            initialData={hospital}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}
