import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Challenges from "@/pages/Challenges";
import Solutions from "@/pages/Solutions";
import VendorPortal from "@/pages/VendorPortal";
import GovernmentPortal from "@/pages/GovernmentPortal";
import ContractingPortal from "@/pages/ContractingPortal";
import ChallengeDetails from "@/pages/ChallengeDetails";
import SolutionDetails from "@/pages/SolutionDetails";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Switch>
      {isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/challenges" component={Challenges} />
          <Route path="/solutions" component={Solutions} />
          <Route path="/vendor-portal" component={VendorPortal} />
          <Route path="/government-portal" component={GovernmentPortal} />
          <Route path="/contracting-portal" component={ContractingPortal} />
          <Route path="/challenges/:id" component={ChallengeDetails} />
          <Route path="/solutions/:id" component={SolutionDetails} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route component={Landing} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
