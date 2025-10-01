// app/supplier/layout.tsx
"use client";
import RoleLayoutSupplier from "@/components/layouts/RoleLayoutSupplier";
import { ReactNode } from "react";

interface SupplierLayoutProps {
  children: ReactNode;
}

export default function SupplierLayout({ children }: SupplierLayoutProps) {
  return <RoleLayoutSupplier role="supplier">{children}</RoleLayoutSupplier>;
}
