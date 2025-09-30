// app/dashboard/layout.tsx
import HospitalSidebar from "@/components/layouts/hospital/Sidebar";
import HospitalNavbar from "@/components/layouts/hospital/Navbar";

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <HospitalSidebar />
      <div className="flex-1 flex flex-col">
        <HospitalNavbar />
        <main className="p-6 flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
