import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { API_URL } from '../../config';
import { Briefcase as BriefcaseBusiness, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's applications
        const applicationsRes = await axios.get(`${API_URL}/api/applications/user`);
        setApplications(applicationsRes.data.applications);
        
        // Fetch recent jobs
        const jobsRes = await axios.get(`${API_URL}/api/jobs?limit=5`);
        setRecentJobs(jobsRes.data.jobs);
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
        <h1 className="text-2xl font-bold text-navy-800 mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-600">
          Track your job applications and discover new opportunities.
        </p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="card p-6 animate-pulse h-32">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <p className="text-gray-600 text-sm mb-2">Total Applications</p>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-4">
                <FileText size={24} />
              </div>
              <span className="text-3xl font-bold text-navy-800">{applications.length}</span>
            </div>
          </div>
          
          <div className="card p-6">
            <p className="text-gray-600 text-sm mb-2">Pending Review</p>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-4">
                <Clock size={24} />
              </div>
              <span className="text-3xl font-bold text-navy-800">
                {applications.filter(app => app.status === 'pending').length}
              </span>
            </div>
          </div>
          
          <div className="card p-6">
            <p className="text-gray-600 text-sm mb-2">Shortlisted</p>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4">
                <CheckCircle2 size={24} />
              </div>
              <span className="text-3xl font-bold text-navy-800">
                {applications.filter(app => app.status === 'shortlisted').length}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent applications */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy-800">Recent Applications</h2>
            <Link to="/dashboard/applications" className="text-primary-600 text-sm font-medium hover:text-primary-700">
              View all
            </Link>
          </div>
          
          {loading ? (
            <div className="card p-6 animate-pulse space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : applications.length > 0 ? (
            <div className="card">
              <div className="divide-y divide-gray-200">
                {applications.slice(0, 5).map((application) => (
                  <div key={application._id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-md bg-primary-100 text-primary-700 flex items-center justify-center">
                          {application.job.postedBy.profileImage ? (
                            <img 
                              src={application.job.postedBy.profileImage} 
                              alt={application.job.company}
                              className="h-12 w-12 rounded-md object-cover" 
                            />
                          ) : (
                            <BriefcaseBusiness size={24} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-navy-800">{application.job.title}</h3>
                          <p className="text-gray-600 text-sm">{application.job.company}</p>
                          <p className="text-gray-500 text-sm mt-1">
                            Applied on {formatDate(application.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className={`badge ${getStatusBadge(application.status)} capitalize`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="flex justify-center mb-4">
                <FileText size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-navy-800 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-6">
                Start applying for jobs to track your applications here.
              </p>
              <Link to="/jobs" className="btn btn-primary mx-auto">
                Browse Jobs
              </Link>
            </div>
          )}
        </div>
        
        {/* Recommended jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy-800">New Jobs</h2>
            <Link to="/jobs" className="text-primary-600 text-sm font-medium hover:text-primary-700">
              View all
            </Link>
          </div>
          
          {loading ? (
            <div className="card animate-pulse space-y-4 p-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-2 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="card">
              <div className="divide-y divide-gray-200">
                {recentJobs.map((job) => (
                  <div key={job._id} className="p-4">
                    <h3 className="font-medium text-navy-800 mb-1">{job.title}</h3>
                    <p className="text-gray-600 text-sm mb-1">{job.company}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="badge badge-gray text-xs">{job.location}</span>
                      <span className="badge badge-gray text-xs">{job.jobType}</span>
                    </div>
                    <Link 
                      to={`/jobs/${job._id}`}
                      className="text-primary-600 text-sm font-medium hover:text-primary-700"
                    >
                      View Job
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-gray-600">No jobs available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;