
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Menu } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-fundraise-blue text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center space-x-2">
          <img 
            src="/placeholder.svg" 
            alt="Logo" 
            className="h-8 w-8 bg-white rounded"
          />
          <Link to="/" className="text-xl font-bold">
            Fundraise Kit
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-white hover:text-fundraise-lightyellow">
            Home
          </Link>
          
          {currentUser && (
            <>
              {isAdmin() && (
                <Link to="/admin" className="text-white hover:text-fundraise-lightyellow">
                  Admin Dashboard
                </Link>
              )}
              <Button 
                variant="outline" 
                className="text-white border-white hover:bg-white hover:text-fundraise-blue"
                onClick={logout}
              >
                Logout
              </Button>
            </>
          )}
          
          {!currentUser && (
            <Link to="/admin">
              <Button 
                variant="outline" 
                className="text-white border-white hover:bg-white hover:text-fundraise-blue"
              >
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu />
        </Button>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-16 right-0 left-0 bg-fundraise-blue z-50 md:hidden">
            <div className="flex flex-col p-4 space-y-3">
              <Link 
                to="/" 
                className="p-2 text-white hover:bg-white hover:text-fundraise-blue rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {currentUser && (
                <>
                  {isAdmin() && (
                    <Link 
                      to="/admin" 
                      className="p-2 text-white hover:bg-white hover:text-fundraise-blue rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    className="text-white border-white hover:bg-white hover:text-fundraise-blue"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}
              
              {!currentUser && (
                <Link 
                  to="/admin" 
                  className="block" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button 
                    variant="outline" 
                    className="w-full text-white border-white hover:bg-white hover:text-fundraise-blue"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
