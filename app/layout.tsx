// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Ojasya Biopharma",
  description: "Reliable Pharma Supply & Delivery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
