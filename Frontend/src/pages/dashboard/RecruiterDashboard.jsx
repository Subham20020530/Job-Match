import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { API_URL } from '../../config';
import { Briefcase as BriefcaseBusiness, Users, UserCheck, BarChart3, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/dashboard/recruiter`);
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'viewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-primary-100 text-primary-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-800 mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Manage your job postings and review applications from potential candidates.
        </p>
      </div>
      
      {/* Dashboard stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Active Jobs</p>
              <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <BriefcaseBusiness size={16} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-navy-800">
                  {stats?.activeJobs || 0}
                </h3>
                <p className="text-xs text-success-500 flex items-center">
                  <ArrowUpRight size={12} className="mr-1" />
                  <span>+2 this week</span>
                </p>
              </div>
              <Link 
                to="/dashboard/manage-jobs" 
                className="text-primary-600 text-xs font-medium hover:text-primary-700"
              >
                View all jobs
              </Link>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Total Applications</p>
              <div className="h-8 w-8 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-navy-800">
                  {stats?.totalApplications || 0}
                </h3>
                <p className="text-xs text-success-500 flex items-center">
                  <ArrowUpRight size={12} className="mr-1" />
                  <span>+14 this week</span>
                </p>
              </div>
              <Link 
                to="/dashboard/applications" 
                className="text-primary-600 text-xs font-medium hover:text-primary-700"
              >
                View applications
              </Link>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Shortlisted</p>
              <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <UserCheck size={16} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-navy-800">
                  {stats?.shortlistedCandidates || 0}
                </h3>
                <p className="text-xs text-success-500 flex items-center">
                  <ArrowUpRight size={12} className="mr-1" />
                  <span>+3 this week</span>
                </p>
              </div>
              <Link 
                to="/dashboard/applications?status=shortlisted" 
                className="text-primary-600 text-xs font-medium hover:text-primary-700"
              >
                View shortlisted
              </Link>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">New Applications</p>
              <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Search size={16} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-navy-800">
                  {stats?.newApplications || 0}
                </h3>
                <p className="text-xs text-error-500 flex items-center">
                  <ArrowDownRight size={12} className="mr-1" />
                  <span>Need review</span>
                </p>
              </div>
              <Link 
                to="/dashboard/applications?status=pending" 
                className="text-primary-600 text-xs font-medium hover:text-primary-700"
              >
                Review now
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Application overview */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy-800">Application Overview</h2>
            <select className="input-field text-sm py-1 px-3">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          {loading ? (
            <div className="card p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <div className="card p-6">
              {/* Chart placeholder */}
              <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Application statistics chart</p>
                </div>
              </div>
              
              {/* Stats summary */}
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: 'Pending', value: stats?.applicationStats.pending || 0, color: 'bg-gray-100 text-gray-800' },
                  { label: 'Viewed', value: stats?.applicationStats.viewed || 0, color: 'bg-blue-100 text-blue-800' },
                  { label: 'Shortlisted', value: stats?.applicationStats.shortlisted || 0, color: 'bg-primary-100 text-primary-800' },
                  { label: 'Rejected', value: stats?.applicationStats.rejected || 0, color: 'bg-red-100 text-red-800' },
                  { label: 'Hired', value: stats?.applicationStats.hired || 0, color: 'bg-green-100 text-green-800' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`inline-block px-3 py-1 rounded-full ${stat.color} text-xs font-medium mb-1`}>
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Recent applicants */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy-800">Recent Applicants</h2>
            <Link 
              to="/dashboard/applications" 
              className="text-primary-600 text-sm font-medium hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          
          {loading ? (
            <div className="card p-6 animate-pulse space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex gap-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentApplicants && stats.recentApplicants.length > 0 ? (
            <div className="card">
              <div className="divide-y divide-gray-200">
                {stats.recentApplicants.map((application) => (
                  <div key={application._id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center overflow-hidden">
                        {application.applicant.profileImage ? (
                          <img 
                            src={application.applicant.profileImage}
                            alt={application.applicant.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {application.applicant.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-navy-800 text-sm">
                          {application.applicant.name}
                        </h3>
                        <p className="text-gray-600 text-xs">
                          Applied for {application.job.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`badge ${getStatusBadge(application.status)} text-xs capitalize`}>
                            {application.status}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {formatDate(application.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-gray-600">No applications received yet.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/dashboard/create-job" className="card p-6 hover:border-primary-500 hover:border group transition-all">
            <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <BriefcaseBusiness size={24} />
            </div>
            <h3 className="text-lg font-bold text-navy-800 mb-2">Post a New Job</h3>
            <p className="text-gray-600 mb-4">
              Create a new job listing to attract qualified candidates.
            </p>
            <div className="text-primary-600 font-medium inline-flex items-center group-hover:text-primary-700">
              Post Job
              <svg className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
          
          <Link to="/dashboard/applications" className="card p-6 hover:border-primary-500 hover:border group transition-all">
            <div className="h-12 w-12 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center mb-4 group-hover:bg-secondary-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-navy-800 mb-2">Review Applications</h3>
            <p className="text-gray-600 mb-4">
              Review and manage applications from potential candidates.
            </p>
            <div className="text-primary-600 font-medium inline-flex items-center group-hover:text-primary-700">
              View Applications
              <svg className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
          
          <Link to="/dashboard/manage-jobs" className="card p-6 hover:border-primary-500 hover:border group transition-all">
            <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-lg font-bold text-navy-800 mb-2">Manage Job Listings</h3>
            <p className="text-gray-600 mb-4">
              Update, edit, or remove your existing job postings.
            </p>
            <div className="text-primary-600 font-medium inline-flex items-center group-hover:text-primary-700">
              Manage Jobs
              <svg className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;