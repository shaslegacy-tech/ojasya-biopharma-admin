// src/hooks/useMR.ts
import useSWR from "swr";
import api from "@/lib/api";
export function useAssignedHospitals() {
  const fetcher = (url: string) => api.get(url).then(r => r.data);
  const { data, error, mutate } = useSWR("/mr/assigned", fetcher);
  return { hospitals: data?.hospitals ?? [], error, mutate };
}