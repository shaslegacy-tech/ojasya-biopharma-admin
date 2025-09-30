// app/admin/layout.tsx
import AdminSidebar from "@/components/layouts/admin/Sidebar";
import AdminNavbar from "@/components/layouts/admin/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <main className="p-6 flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
