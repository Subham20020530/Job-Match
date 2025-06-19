import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import RecruiterDashboard from './pages/dashboard/RecruiterDashboard';
import JobSeekerDashboard from './pages/dashboard/JobSeekerDashboard';
import CreateJob from './pages/dashboard/CreateJob';
import ManageJobs from './pages/dashboard/ManageJobs';
import Applications from './pages/dashboard/Applications';
import Profile from './pages/dashboard/Profile';
import NotFound from './pages/NotFound';

const App = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full animate-ping bg-primary-100 opacity-50"></div>
        </div>
        <p className="mt-4 text-primary-500 font-semibold text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" replace /> : <Register />}
          />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}
        >
          <Route
            index
            element={
              user?.role === 'recruiter'
                ? <RecruiterDashboard />
                : <JobSeekerDashboard />
            }
          />
          <Route path="profile" element={<Profile />} />
          <Route path="applications" element={<Applications />} />

          {/* Recruiter-only routes */}
          <Route
            path="create-job"
            element={
              user?.role === 'recruiter'
                ? <CreateJob />
                : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="manage-jobs"
            element={
              user?.role === 'recruiter'
                ? <ManageJobs />
                : <Navigate to="/dashboard" replace />
            }
          />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
