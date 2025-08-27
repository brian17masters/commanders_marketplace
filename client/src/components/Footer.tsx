import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Footer() {
  const [, setLocation] = useLocation();

  return (
    <footer className="army-green text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Organization Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64" 
                alt="AI Neural Network" 
                className="w-16 h-16 rounded-full border-2 border-accent" 
              />
              <img 
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64" 
                alt="Edge Computing" 
                className="w-16 h-16 rounded border-2 border-accent" 
              />
            </div>
            <h3 className="text-xl font-bold mb-4">G-TEAD Marketplace</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The Army's premier digital environment for rapidly sourcing, evaluating, and procuring innovative technologies from U.S., NATO, and foreign vendors. Supporting USAREUR-AF's immediate needs while providing a scalable foundation for all Combatant Commands.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-accent p-2"
                data-testid="social-twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-accent p-2"
                data-testid="social-linkedin"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Button>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  className="text-gray-300 hover:text-accent transition-colors text-left"
                  onClick={() => setLocation("/#challenges")}
                  data-testid="footer-link-challenges"
                >
                  Active Challenges
                </button>
              </li>
              <li>
                <button 
                  className="text-gray-300 hover:text-accent transition-colors text-left"
                  onClick={() => setLocation("/#solutions")}
                  data-testid="footer-link-solutions"
                >
                  Browse Solutions
                </button>
              </li>
              <li>
                <button 
                  className="text-gray-300 hover:text-accent transition-colors text-left"
                  onClick={() => setLocation("/vendor-portal")}
                  data-testid="footer-link-vendor"
                >
                  Vendor Registration
                </button>
              </li>
              <li>
                <button 
                  className="text-gray-300 hover:text-accent transition-colors text-left"
                  onClick={() => setLocation("/government-portal")}
                  data-testid="footer-link-government"
                >
                  Government Access
                </button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="text-gray-300 hover:text-accent p-0 h-auto font-normal"
                  data-testid="footer-link-playbook"
                >
                  Acquisition Playbook
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="text-gray-300 hover:text-accent p-0 h-auto font-normal"
                  data-testid="footer-link-support"
                >
                  Support & Documentation
                </Button>
              </li>
            </ul>
          </div>
          
          {/* Contact & Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact & Support</h4>
            <div className="space-y-3 text-gray-300">
              <div>
                <p className="font-medium">Technical Support</p>
                <p className="text-sm">support@g-tead.army.mil</p>
              </div>
              <div>
                <p className="font-medium">Vendor Relations</p>
                <p className="text-sm">vendors@g-tead.army.mil</p>
              </div>
              <div>
                <p className="font-medium">Government Inquiries</p>
                <p className="text-sm">government@g-tead.army.mil</p>
              </div>
              <div>
                <p className="font-medium">Partnership Opportunities</p>
                <p className="text-sm">partnerships@g-tead.army.mil</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <p className="text-gray-300">&copy; 2025 U.S. Army G-TEAD. All rights reserved.</p>
              <Button 
                variant="link" 
                className="text-gray-300 hover:text-accent p-0 h-auto"
                data-testid="footer-link-privacy"
              >
                Privacy Policy
              </Button>
              <Button 
                variant="link" 
                className="text-gray-300 hover:text-accent p-0 h-auto"
                data-testid="footer-link-terms"
              >
                Terms of Use
              </Button>
              <Button 
                variant="link" 
                className="text-gray-300 hover:text-accent p-0 h-auto"
                data-testid="footer-link-accessibility"
              >
                Accessibility
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Powered by</span>
              <span className="army-gold-text font-semibold">AI-Enhanced Procurement</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
