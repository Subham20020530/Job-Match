import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Briefcase as BriefcaseBusiness, Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-primary-500">
              <BriefcaseBusiness size={28} />
              <span className="text-xl font-bold">JobMatch</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/jobs" className="px-3 py-2 text-navy-700 hover:text-primary-500 transition-colors">
              Find Jobs
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="px-3 py-2 text-navy-700 hover:text-primary-500 transition-colors">
                  Dashboard
                </Link>
                <Link to="/dashboard/profile" className="px-3 py-2 text-navy-700 hover:text-primary-500 transition-colors">
                  Profile
                </Link>
                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline text-sm">Sign in</Link>
                <Link to="/register" className="btn btn-primary text-sm">Register</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-navy-700 hover:text-primary-500"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-navy-700 hover:bg-gray-50 hover:text-primary-500 rounded-md">
              Find Jobs
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-navy-700 hover:bg-gray-50 hover:text-primary-500 rounded-md">
                  Dashboard
                </Link>
                <Link to="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-navy-700 hover:bg-gray-50 hover:text-primary-500 rounded-md">
                  <div className="flex items-center gap-2">
                    <User size={18} />
                    Profile
                  </div>
                </Link>
              </>
            ) : (
              <div className="pt-2 flex flex-col space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline text-sm w-full">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary text-sm w-full">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
