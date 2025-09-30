// app/supplier/layout.tsx
import SupplierSidebar from "@/components/layouts/supplier/Sidebar";
import SupplierNavbar from "@/components/layouts/supplier/Navbar";

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SupplierSidebar />
      <div className="flex-1 flex flex-col">
        <SupplierNavbar />
        <main className="p-6 flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
