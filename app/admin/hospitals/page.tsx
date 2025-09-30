import React from 'react';

const hospitals = [
  { name: 'City Hospital', contact: '1234567890', address: '123 Main St' },
  { name: 'HealthPlus', contact: '9876543210', address: '45 West Ave' },
  { name: 'CareMed', contact: '4567891230', address: '78 East Blvd' },
];

export default function HospitalsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hospitals</h1>
      <div className="bg-white p-6 rounded-2xl shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Address</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map((h) => (
              <tr key={h.name} className="border-b hover:bg-gray-50">
                <td className="p-3">{h.name}</td>
                <td className="p-3">{h.contact}</td>
                <td className="p-3">{h.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
