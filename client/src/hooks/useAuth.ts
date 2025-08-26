import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (mounted) {
            setUser(userData);
            setError(null);
          }
        } else {
          if (mounted) {
            setUser(null);
            setError(null);
          }
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch: () => {
      setIsLoading(true);
      // Trigger re-check
      window.location.reload();
    }
  };
}
