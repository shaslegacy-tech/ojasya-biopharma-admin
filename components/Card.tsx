interface CardProps {
  title: string;
  value: number | string;
  gradient?: string;
}

export default function Card({ title, value, gradient = 'from-blue-500 to-cyan-400' }: CardProps) {
  return (
    <div className={`p-6 rounded-2xl shadow bg-gradient-to-r ${gradient} text-white`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
