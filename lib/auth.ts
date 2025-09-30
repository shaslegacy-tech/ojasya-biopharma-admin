
// lib/auth.ts
import { jwtVerify } from "jose";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function verifyJWT(token: string): Promise<{ role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET));
    return payload as { role: string };
  } catch {
    return null;
  }
}


export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};
