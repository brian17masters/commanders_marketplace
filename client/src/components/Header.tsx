import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { AuthButtons } from "@/components/AuthButtons";

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="army-green shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <img 
              src="https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64" 
              alt="U.S. Army Crest" 
              className="w-12 h-12 rounded-full border-2 border-accent" 
            />
            <div>
              <h1 
                className="text-xl font-bold text-white cursor-pointer"
                onClick={() => handleNavigation("/")}
                data-testid="text-app-title"
              >
                G-TEAD Marketplace
              </h1>
              <p className="text-sm text-gray-300">Army Technology Solutions</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              className="text-white hover:text-accent transition-colors"
              onClick={() => handleNavigation("/")}
              data-testid="nav-home"
            >
              Home
            </button>
            <button 
              className="text-white hover:text-accent transition-colors"
              onClick={() => handleNavigation("/challenges")}
              data-testid="nav-challenges"
            >
              Challenges
            </button>
            <button 
              className="text-white hover:text-accent transition-colors"
              onClick={() => handleNavigation("/solutions")}
              data-testid="nav-solutions"
            >
              Solutions
            </button>
            
            {isAuthenticated && user?.role === "vendor" && (
              <button 
                className="text-white hover:text-accent transition-colors"
                onClick={() => handleNavigation("/vendor-portal")}
                data-testid="nav-vendor-portal"
              >
                Vendor Portal
              </button>
            )}
            
            {isAuthenticated && ["government", "contracting_officer", "admin"].includes(user?.role || "") && (
              <button 
                className="text-white hover:text-accent transition-colors"
                onClick={() => handleNavigation("/government-portal")}
                data-testid="nav-government-portal"
              >
                Government Portal
              </button>
            )}
            
            {isAuthenticated && ["contracting_officer", "admin"].includes(user?.role || "") && (
              <button 
                className="text-white hover:text-accent transition-colors"
                onClick={() => handleNavigation("/contracting-portal")}
                data-testid="nav-contracting-portal"
              >
                Contracting Portal
              </button>
            )}
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-white text-sm" data-testid="text-user-welcome">
                    Welcome, {user?.firstName || user?.email}
                  </span>
                  <Button 
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-primary"
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="button-logout"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <AuthButtons variant="header" />
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white" 
            onClick={toggleMobileMenu}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 w-full h-full bg-primary z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button 
                onClick={toggleMobileMenu} 
                className="text-white"
                data-testid="button-close-mobile-menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-4">
              <button 
                className="block w-full text-left text-white hover:text-accent py-2"
                onClick={() => handleNavigation("/")}
                data-testid="mobile-nav-home"
              >
                Home
              </button>
              <button 
                className="block w-full text-left text-white hover:text-accent py-2"
                onClick={() => handleNavigation("/challenges")}
                data-testid="mobile-nav-challenges"
              >
                Challenges
              </button>
              <button 
                className="block w-full text-left text-white hover:text-accent py-2"
                onClick={() => handleNavigation("/solutions")}
                data-testid="mobile-nav-solutions"
              >
                Solutions
              </button>
              
              {isAuthenticated && user?.role === "vendor" && (
                <button 
                  className="block w-full text-left text-white hover:text-accent py-2"
                  onClick={() => handleNavigation("/vendor-portal")}
                  data-testid="mobile-nav-vendor-portal"
                >
                  Vendor Portal
                </button>
              )}
              
              {isAuthenticated && ["government", "contracting_officer", "admin"].includes(user?.role || "") && (
                <button 
                  className="block w-full text-left text-white hover:text-accent py-2"
                  onClick={() => handleNavigation("/government-portal")}
                  data-testid="mobile-nav-government-portal"
                >
                  Government Portal
                </button>
              )}
              
              {isAuthenticated && ["contracting_officer", "admin"].includes(user?.role || "") && (
                <button 
                  className="block w-full text-left text-white hover:text-accent py-2"
                  onClick={() => handleNavigation("/contracting-portal")}
                  data-testid="mobile-nav-contracting-portal"
                >
                  Contracting Portal
                </button>
              )}
              
              <div className="pt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="text-white text-sm mb-2">
                      Signed in as {user?.firstName || user?.email}
                    </div>
                    <Button 
                      className="w-full bg-accent text-primary"
                      onClick={() => window.location.href = "/api/logout"}
                      data-testid="mobile-button-logout"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => window.location.href = "/api/login/google"}
                      data-testid="mobile-button-google-signin"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                    <Button 
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                      onClick={() => window.location.href = "/api/login/replit"}
                      data-testid="mobile-button-replit-signin"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 3.5c-2.5 0-4.5 2-4.5 4.5v8c0 2.5 2 4.5 4.5 4.5h4v-6h-4v-2h6.5c.5 0 1-.5 1-1v-3c0-2.5-2-4.5-4.5-4.5h-3z"/>
                      </svg>
                      Replit
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
