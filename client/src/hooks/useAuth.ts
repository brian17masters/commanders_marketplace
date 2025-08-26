import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: Infinity, // Never refetch automatically
    gcTime: Infinity, // Keep in cache indefinitely
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
