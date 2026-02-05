import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";

export function useAuth() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const { data } = await api.get('/auth/me');
        return data;
      } catch (err) {
        return null; 
      }
    },
    retry: false,
  });
}