'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Hospital } from '@/types/hospital';

export default function AdminHospitalsPage() {
 const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    fetch('/api/hospitals')
      .then(res => res.json())
      .then(setHospitals);
  }, []);

  const approve = async (id: string) => {
    await fetch(`/api/hospitals/${id}/approve`, { method: 'PUT' });
    setHospitals(hospitals.map(h => h._id === id ? { ...h, approved: true } : h));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Hospitals</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Approved</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {hospitals.map(h => (
            <tr key={h._id} className="border-t">
              <td className="p-2">{h.name}</td>
              <td className="p-2">{h.email}</td>
              <td className="p-2">{h.approved ? '✅' : '❌'}</td>
              <td className="p-2">
                {!h.approved && (
                  <Button size="sm" onClick={() => approve(h._id)}>Approve</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
