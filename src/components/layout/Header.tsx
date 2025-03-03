import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Menu, X, Truck, ChevronDown } from 'lucide-react';
import NotificationCenter from '../notifications/NotificationCenter';
import { APP_NAME } from '../../config';

const Header: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };
  
  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-gray-900 shadow-md' : 'bg-gray-900 bg-opacity-95'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Truck size={28} className="text-yellow-400" />
            <span className="text-xl font-bold text-white">{APP_NAME}</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className={`text-gray-300 hover:text-white ${
              location.pathname === '/' ? 'text-white font-medium' : ''
            }`}>
              Home
            </Link>
            <Link to="/auctions" className={`text-gray-300 hover:text-white ${
              location.pathname === '/auctions' ? 'text-white font-medium' : ''
            }`}>
              Auctions
            </Link>
            <Link to="/how-it-works" className={`text-gray-300 hover:text-white ${
              location.pathname === '/how-it-works' ? 'text-white font-medium' : ''
            }`}>
              How It Works
            </Link>
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <NotificationCenter />
                
                <div className="relative">
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-2 text-white hover:text-gray-200 focus:outline-none"
                  >
                    <span>{user?.username}</span>
                    <ChevronDown size={16} className={`transition-transform ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      {user?.role === 'admin' && (
                        <>
                          <Link
                            to="/admin/auctions"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Manage Auctions
                          </Link>
                          <Link
                            to="/admin/verifications"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Verify Users
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded-md font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && <NotificationCenter />}
            <button
              onClick={toggleMenu}
              className="ml-2 text-gray-300 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-300 hover:text-white py-2">
                Home
              </Link>
              <Link to="/auctions" className="text-gray-300 hover:text-white py-2">
                Auctions
              </Link>
              <Link to="/how-it-works" className="text-gray-300 hover:text-white py-2">
                How It Works
              </Link>
              
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-700 my-2"></div>
                  <Link to="/dashboard" className="text-gray-300 hover:text-white py-2">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="text-gray-300 hover:text-white py-2">
                    Profile Settings
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <Link to="/admin/auctions" className="text-gray-300 hover:text-white py-2">
                        Manage Auctions
                      </Link>
                      <Link to="/admin/verifications" className="text-gray-300 hover:text-white py-2">
                        Verify Users
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-300 hover:text-white py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-700 my-2"></div>
                  <Link to="/login" className="text-gray-300 hover:text-white py-2">
                    Sign In
                  </Link>
                  <Link to="/register" className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded-md font-medium text-center">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;