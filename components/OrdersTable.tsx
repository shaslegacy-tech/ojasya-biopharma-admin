const orders = [
  { id: 'ORD001', hospital: 'City Hospital', medicine: 'Injection A', quantity: 50, status: 'Pending' },
  { id: 'ORD002', hospital: 'HealthPlus', medicine: 'Injection B', quantity: 30, status: 'Delivered' },
  { id: 'ORD003', hospital: 'CareMed', medicine: 'Injection C', quantity: 20, status: 'Pending' },
];

export default function OrdersTable() {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-3">Order ID</th>
          <th className="p-3">Hospital</th>
          <th className="p-3">Medicine</th>
          <th className="p-3">Quantity</th>
          <th className="p-3">Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id} className="border-b hover:bg-gray-50">
            <td className="p-3">{o.id}</td>
            <td className="p-3">{o.hospital}</td>
            <td className="p-3">{o.medicine}</td>
            <td className="p-3">{o.quantity}</td>
            <td className={`p-3 font-semibold ${o.status === 'Delivered' ? 'text-green-500' : 'text-orange-500'}`}>
              {o.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
