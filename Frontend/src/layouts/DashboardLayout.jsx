import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Briefcase as BriefcaseBusiness, LayoutDashboard, FileText, PlusCircle, User, LogOut, Menu, X, List } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  const navLinkClass = ({ isActive }) => {
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      isActive
        ? 'bg-primary-50 text-primary-600 font-medium'
        : 'text-navy-700 hover:bg-gray-100'
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for tablet and desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-5 border-b">
            <div className="flex items-center gap-2 text-primary-500">
              <BriefcaseBusiness size={28} />
              <span className="text-xl font-bold">JobMatch</span>
            </div>
            <button
              className="md:hidden p-2 rounded-md text-navy-700 hover:bg-gray-100 focus:outline-none"
              onClick={closeSidebar}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Sidebar content */}
          <div className="flex-1 py-6 flex flex-col justify-between">
            <nav className="px-3 space-y-1">
              <NavLink to="/dashboard" end className={navLinkClass} onClick={closeSidebar}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink to="/dashboard/profile" className={navLinkClass} onClick={closeSidebar}>
                <User size={20} />
                <span>Profile</span>
              </NavLink>
              
              <NavLink to="/dashboard/applications" className={navLinkClass} onClick={closeSidebar}>
                <FileText size={20} />
                <span>Applications</span>
              </NavLink>
              
              {user?.role === 'recruiter' && (
                <>
                  <NavLink to="/dashboard/create-job" className={navLinkClass} onClick={closeSidebar}>
                    <PlusCircle size={20} />
                    <span>Post a Job</span>
                  </NavLink>
                  
                  <NavLink to="/dashboard/manage-jobs" className={navLinkClass} onClick={closeSidebar}>
                    <List size={20} />
                    <span>Manage Jobs</span>
                  </NavLink>
                </>
              )}
            </nav>
            
            <div className="px-3 mt-6">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-navy-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <LogOut size={20} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Top navbar */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              className="p-2 rounded-md text-navy-700 hover:bg-gray-100 focus:outline-none md:hidden"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center overflow-hidden">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-navy-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;