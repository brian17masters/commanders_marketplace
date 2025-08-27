import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Landing from "./Landing";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();



  // For now, authenticated users see the same landing page
  // In a full implementation, this would be a personalized dashboard
  return <Landing />;
}
