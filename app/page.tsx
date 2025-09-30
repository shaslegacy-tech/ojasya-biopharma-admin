// app/page.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 via-green-600 to-cyan-700 text-white py-20">
        <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-10 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Reliable Pharma Supply & Delivery <br /> for Hospitals & Medicals
            </h1>
            <p className="mt-6 text-lg opacity-90">
              Order injections and medicines from multiple brands, delivered fast
              & secure.
            </p>
            <div className="mt-8 flex gap-4">
              <Button className="bg-white text-teal-700 hover:bg-gray-100" onClick={() => router.push("/auth/login")}>
                Login
              </Button>
              <Button className="bg-teal-800 hover:bg-teal-900" onClick={() => router.push("/auth/register")}>Register</Button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="flex justify-center">
            <Image
              src="/images/hero-doctor.png" // Replace with illustration
              alt="Pharma Illustration"
              width={400}
              height={400}
              className="drop-shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">How It Works</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              title: "Place orders online or via app",
              icon: "✅",
            },
            {
              title: "Prescription upload",
              icon: "📄",
            },
            {
              title: "Multiple brand options",
              icon: "💊",
            },
            {
              title: "Track orders & invoices",
              icon: "📑",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center bg-white shadow-md p-6 rounded-2xl hover:shadow-xl transition"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <p className="font-medium">{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Our Partners</h2>
          <div className="flex flex-wrap justify-center items-center gap-10">
            {["zydus.svg", "abbott.svg", "cipla.svg", "sun.svg"].map((logo) => (
              <Image
                key={logo}
                src={`/partners/${logo}`}
                alt={logo}
                width={100}
                height={50}
                className="grayscale hover:grayscale-0 transition"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">Why Choose Ojasya Biopharma</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Fast delivery", icon: "⚡" },
            { title: "Verified suppliers", icon: "✔️" },
            { title: "Secure payments", icon: "🔒" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white shadow-md p-6 rounded-2xl hover:shadow-xl transition"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <p className="font-medium">{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Ojasya Biopharma</h3>
            <p className="text-sm opacity-70">Reliable pharma solutions</p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-teal-400">
              LinkedIn
            </a>
            <a href="#" className="hover:text-teal-400">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
