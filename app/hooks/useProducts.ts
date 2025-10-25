// src/hooks/useProducts.ts
import useSWR from "swr";
import api from "@/lib/api";
export function useProducts() {
  const { data, error, mutate } = useSWR("/products", () => api.get("/products").then(r => r.data));
  return { products: data?.products ?? data ?? [], error, mutate };
}