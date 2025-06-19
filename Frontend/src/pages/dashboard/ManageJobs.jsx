import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import { Briefcase as BriefcaseBusiness, Clock, Users, Eye, Pencil, Trash2, Search, Filter, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [deleteStatus, setDeleteStatus] = useState('idle');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/jobs/recruiter`);
        setJobs(res.data.jobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);
  
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Check if job is active
  const isJobActive = (job) => {
    if (!job.applicationDeadline) return true;
    
    const deadline = new Date(job.applicationDeadline);
    const now = new Date();
    
    return deadline >= now;
  };
  
  // Get time ago for job posting
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffInMs = now.getTime() - postedDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };
  
  // Filter jobs
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const filteredJobs = jobs.filter(job => {
    // Status filter
    if (filters.status === 'active' && !isJobActive(job)) return false;
    if (filters.status === 'expired' && isJobActive(job)) return false;
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });
  
  // Delete job
  const openDeleteModal = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };
  
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
    setDeleteStatus('idle');
  };
  
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      setDeleteStatus('loading');
      
      await axios.delete(`${API_URL}/api/jobs/${jobToDelete._id}`);
      
      setJobs(jobs.filter(job => job._id !== jobToDelete._id));
      setDeleteStatus('success');
      
      setTimeout(() => {
        closeDeleteModal();
      }, 1500);
    } catch (err) {
      console.error('Error deleting job:', err);
      setDeleteStatus('error');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 mb-2">Manage Jobs</h1>
          <p className="text-gray-600">
            View, edit, or delete your job listings.
          </p>
        </div>
        
        <Link to="/dashboard/create-job" className="btn btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={18} />
          Post New Job
        </Link>
      </div>
      
      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="pl-10 input-field"
              placeholder="Search jobs by title, company, or location"
            />
          </div>
          
          <div className="w-full md:w-48">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Jobs</option>
              <option value="active">Active Jobs</option>
              <option value="expired">Expired Jobs</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Jobs list */}
      {loading ? (
        <div className="card p-6 animate-pulse space-y-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
              <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-navy-800">Job</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-800">Applications</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-800">Date Posted</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-800">Deadline</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy-800">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-navy-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center">
                          <BriefcaseBusiness size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium text-navy-800">{job.title}</h3>
                          <p className="text-gray-600 text-sm">
                            {job.location} • {job.jobType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-500" />
                        <span>12 applicants</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        <span>{getTimeAgo(job.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {job.applicationDeadline ? (
                        <span>{formatDate(job.applicationDeadline)}</span>
                      ) : (
                        <span className="text-gray-500">No deadline</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge ${isJobActive(job) ? 'badge-blue' : 'badge-gray'}`}>
                        {isJobActive(job) ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/jobs/${job._id}`} 
                          className="p-1.5 rounded-md text-gray-500 hover:text-navy-700 hover:bg-gray-100"
                          title="View Job"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/dashboard/edit-job/${job._id}`} 
                          className="p-1.5 rounded-md text-gray-500 hover:text-navy-700 hover:bg-gray-100"
                          title="Edit Job"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(job)}
                          className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-100"
                          title="Delete Job"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="flex justify-center mb-4">
            {filters.search || filters.status ? (
              <Filter size={48} className="text-gray-400" />
            ) : (
              <BriefcaseBusiness size={48} className="text-gray-400" />
            )}
          </div>
          <h3 className="text-xl font-bold text-navy-800 mb-2">
            {filters.search || filters.status 
              ? 'No jobs match your filters' 
              : 'No jobs posted yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status 
              ? 'Try adjusting your filters or search terms.' 
              : 'Start by posting your first job listing to find great candidates.'}
          </p>
          {(filters.search || filters.status) ? (
            <button
              onClick={() => setFilters({ search: '', status: '' })}
              className="btn btn-primary mx-auto mb-4"
            >
              Clear Filters
            </button>
          ) : null}
          <Link to="/dashboard/create-job" className="btn btn-primary mx-auto">
            <Plus size={18} className="mr-1" />
            Post a Job
          </Link>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteModal && jobToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-navy-900 bg-opacity-50" onClick={closeDeleteModal}></div>
            
            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              {deleteStatus === 'error' && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-start">
                  <AlertTriangle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                  <span>Failed to delete job. Please try again.</span>
                </div>
              )}
              
              {deleteStatus === 'success' ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={48} className="mx-auto text-success-500 mb-4" />
                  <h3 className="text-xl font-bold text-navy-800 mb-2">Job Deleted</h3>
                  <p className="text-gray-600">
                    The job listing has been successfully deleted.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-navy-800 mb-2">Delete Job Listing</h3>
                    <p className="text-gray-600">
                      Are you sure you want to delete this job listing? This action cannot be undone.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium text-navy-800">{jobToDelete.title}</h4>
                    <p className="text-gray-600 text-sm">
                      {jobToDelete.location} • {jobToDelete.jobType}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      className="btn btn-outline flex-1"
                      disabled={deleteStatus === 'loading'}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteJob}
                      className="btn flex-1 bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-300 focus:outline-none"
                      disabled={deleteStatus === 'loading'}
                    >
                      {deleteStatus === 'loading' ? 'Deleting...' : 'Delete Job'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;