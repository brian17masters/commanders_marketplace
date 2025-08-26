import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";

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
              onClick={() => handleNavigation("/#challenges")}
              data-testid="nav-challenges"
            >
              Challenges
            </button>
            <button 
              className="text-white hover:text-accent transition-colors"
              onClick={() => handleNavigation("/#solutions")}
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
                <>
                  <Button 
                    className="bg-accent text-primary font-medium hover:bg-yellow-500 transition-colors"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="button-signin"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-primary transition-colors"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="button-register"
                  >
                    Register
                  </Button>
                </>
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
                onClick={() => handleNavigation("/#challenges")}
                data-testid="mobile-nav-challenges"
              >
                Challenges
              </button>
              <button 
                className="block w-full text-left text-white hover:text-accent py-2"
                onClick={() => handleNavigation("/#solutions")}
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
                  <>
                    <Button 
                      className="w-full bg-accent text-primary"
                      onClick={() => window.location.href = "/api/login"}
                      data-testid="mobile-button-signin"
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-accent text-accent"
                      onClick={() => window.location.href = "/api/login"}
                      data-testid="mobile-button-register"
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
