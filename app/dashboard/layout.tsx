// hospital/layout.tsx
import RoleLayoutHospital from "@/components/layouts/RoleLayoutHospital";
import { ReactNode } from "react";

interface HospitalLayoutProps {
  children: ReactNode;
}

export default function HospitalLayout({ children }: HospitalLayoutProps) {
  return <RoleLayoutHospital role="hospital">{children}</RoleLayoutHospital>;
}
