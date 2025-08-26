import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface AuthButtonsProps {
  variant?: "header" | "landing";
  className?: string;
}

export function AuthButtons({ variant = "header", className }: AuthButtonsProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  if (variant === "header") {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-accent text-primary font-medium hover:bg-yellow-500 transition-colors"
              data-testid="button-signin"
            >
              Sign In
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sign In to G-TEAD Marketplace</DialogTitle>
              <DialogDescription>
                Choose your preferred sign-in method to access the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button 
                className="w-full flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                onClick={() => window.location.href = "/api/login/google"}
                data-testid="button-google-signin"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <Button 
                className="w-full flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => window.location.href = "/api/login/replit"}
                data-testid="button-replit-signin"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 3.5c-2.5 0-4.5 2-4.5 4.5v8c0 2.5 2 4.5 4.5 4.5h4v-6h-4v-2h6.5c.5 0 1-.5 1-1v-3c0-2.5-2-4.5-4.5-4.5h-3z"/>
                </svg>
                Continue with Replit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline"
          className="border-accent text-accent hover:bg-accent hover:text-primary transition-colors"
          onClick={() => setShowAuthDialog(true)}
          data-testid="button-register"
        >
          Register
        </Button>
      </div>
    );
  }

  // Landing page variant
  return (
    <div className={`space-y-4 ${className}`}>
      <Button 
        size="lg"
        className="w-full flex items-center gap-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-lg py-6"
        onClick={() => window.location.href = "/api/login/google"}
        data-testid="button-google-signin-landing"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>
      
      <Button 
        size="lg"
        className="w-full flex items-center gap-3 bg-blue-600 text-white hover:bg-blue-700 text-lg py-6"
        onClick={() => window.location.href = "/api/login/replit"}
        data-testid="button-replit-signin-landing"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 3.5c-2.5 0-4.5 2-4.5 4.5v8c0 2.5 2 4.5 4.5 4.5h4v-6h-4v-2h6.5c.5 0 1-.5 1-1v-3c0-2.5-2-4.5-4.5-4.5h-3z"/>
        </svg>
        Continue with Replit
      </Button>
      
      <div className="text-center text-sm text-gray-600">
        Choose your preferred authentication method to access the G-TEAD Marketplace
      </div>
    </div>
  );
}