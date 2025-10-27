// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import ToasterClient from "@/components/ToasterClient";

export const metadata: Metadata = {
  title: "Ojasya Biopharma",
  description: "Reliable Pharma Supply & Delivery",
};


function setInitialColorModeScript() {
  // This runs before React mounts and prevents flash.
  return `
    (function () {
      try {
        var dark = localStorage.getItem('supplier_dark') === '1'
                  || localStorage.getItem('dark') === '1';
        if (dark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } catch (e) {}
    })();
  `;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: setInitialColorModeScript() }} />
      </head>
      <body className="bg-white text-gray-900">
        <AuthProvider>{children}</AuthProvider>
        <ToasterClient />
      </body>
    </html>
  );
}
