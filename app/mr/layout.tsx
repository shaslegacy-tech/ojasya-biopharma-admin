// MR/layout.tsx
import RoleLayoutMrs from "@/components/layouts/RoleLayoutMrs";
import { ReactNode } from "react";

interface MRLayoutProps {
  children: ReactNode;
}

export default function MRLayout({ children }: MRLayoutProps) {
  return <RoleLayoutMrs>{children}</RoleLayoutMrs>;
}
