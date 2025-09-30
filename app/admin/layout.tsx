import RoleLayout from "@/components/layouts/RoleLayout";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <RoleLayout role="admin">{children}</RoleLayout>;
}
