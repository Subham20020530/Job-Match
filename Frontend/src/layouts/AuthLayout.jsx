import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Briefcase as BriefcaseBusiness } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-gray-50">
        <div className="max-w-md mx-auto p-6 my-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
              <BriefcaseBusiness size={32} />
            </div>
            <h1 className="text-2xl font-bold text-navy-800">Welcome to JobMatch</h1>
            <p className="text-gray-600 mt-2">Find your perfect career match today</p>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl p-6">
            <Outlet />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuthLayout;