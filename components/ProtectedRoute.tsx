// components/ProtectedRoute.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Array<"hospital" | "supplier" | "admin">; // allowed roles
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in
        router.push("/auth/login");
      } else if (roles && !roles.includes(user.role)) {
        // Logged in but role not allowed
        router.push("/unauthorized"); // optional page
      }
    }
  }, [user, loading, roles, router]);

  // Show nothing or a loading indicator while checking
  if (loading || !user) return <div>Loading...</div>;

  return <>{children}</>;
}
