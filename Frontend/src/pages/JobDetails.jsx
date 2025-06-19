import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Briefcase as BriefcaseBusiness, MapPin, DollarSign, Calendar, Building, Users,
  CheckCircle2, AlertTriangle, Share2, Clock, Bookmark
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const JobDetails = () => {
  const { id } = useParams();
  const { fetchJobById } = useJobs();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [applyStatus, setApplyStatus] = useState('idle');
  const [hasApplied, setHasApplied] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false); // ⬅ Added

  // Fetch job data
  useEffect(() => {
    const getJobDetails = async () => {
      if (!id) return;

      setError(null);
      try {
        const jobData = await fetchJobById(id);
        setJob(jobData);

        if (user) {
          const res = await axios.get(`${API_URL}/api/applications/check/${id}`);
          setHasApplied(res.data.hasApplied);
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err.message || 'Failed to load job details');
      }
    };

    getJobDetails();
  }, [id, fetchJobById, user]);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingDone(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const handleApply = async () => {
    if (!user || !job) return;

    try {
      setApplyStatus('loading');
      await axios.post(`${API_URL}/api/applications`, {
        jobId: job._id,
        recruiterId: job.postedBy._id,
      });
      setApplyStatus('success');
      setHasApplied(true);
    } catch (err) {
      console.error('Error applying for job:', err);
      setApplyStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        {!job && !loadingDone ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="animate-pulse text-primary-500 text-xl">Loading job details...</div>
          </div>
        ) : !job && loadingDone ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-red-500 text-xl font-semibold">Job not found or failed to load.</div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Job Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                        {job.postedBy.profileImage ? (
                          <img src={job.postedBy.profileImage} alt={job.company} className="h-16 w-16 rounded-lg object-cover" />
                        ) : (
                          <BriefcaseBusiness size={32} />
                        )}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-navy-800">{job.title}</h1>
                        <p className="text-gray-600">{job.company}</p>
                        {job.sector && <p className="text-sm text-primary-600 font-medium">{job.sector}</p>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-blue">{job.jobType}</span>
                      <span className="badge badge-gray">{job.experienceLevel}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-navy-700">
                      <MapPin size={18} className="text-gray-500" />
                      <span>{job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-2 text-navy-700">
                        <DollarSign size={18} className="text-gray-500" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-navy-700">
                      <Clock size={18} className="text-gray-500" />
                      <span>Posted on {formatDate(job.createdAt)}</span>
                    </div>
                    {job.applicationDeadline && (
                      <div className="flex items-center gap-2 text-navy-700">
                        <Calendar size={18} className="text-gray-500" />
                        <span>Apply before {formatDate(job.applicationDeadline)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-outline text-sm gap-2">
                      <Share2 size={16} />
                      Share
                    </button>
                    <button className="btn btn-outline text-sm gap-2">
                      <Bookmark size={16} />
                      Save
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-navy-800 mb-4">Job Description</h2>
                  <p className="text-navy-700 mb-6">{job.description}</p>

                  <h2 className="text-xl font-bold text-navy-800 mb-4">Requirements</h2>
                  <ul className="space-y-2 mb-6">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-navy-700">
                        <CheckCircle2 size={18} className="text-success-500 mt-1" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>

                  <h2 className="text-xl font-bold text-navy-800 mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.skills.map((skill, i) => (
                      <span key={i} className="badge badge-teal">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-navy-800 mb-4">About {job.company}</h2>
                  <div className="flex items-center gap-3 mb-4">
                    <Building size={18} className="text-gray-500" />
                    <span className="text-navy-700">Company - {job.jobType}</span>
                  </div>
                  <p className="text-navy-700 mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod...
                  </p>
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-gray-500" />
                    <span className="text-navy-700">50–200 employees</span>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-navy-800 mb-4">Apply for this job</h2>

                  {!user ? (
                    <div className="text-center p-4 bg-gray-50 rounded-lg mb-6">
                      <p className="text-navy-700 mb-4">Sign in to apply for this job</p>
                      <Link to="/login" className="btn btn-primary w-full mb-3">Sign In</Link>
                      <Link to="/register" className="btn btn-outline w-full">Create Account</Link>
                    </div>
                  ) : user.role === 'recruiter' ? (
                    <div className="text-center p-4 bg-gray-50 rounded-lg mb-6">
                      <p className="text-navy-700 mb-4">
                        You are logged in as a recruiter. Only job seekers can apply for jobs.
                      </p>
                    </div>
                  ) : hasApplied ? (
                    <div className="bg-success-500 bg-opacity-10 p-4 rounded-lg mb-6">
                      <div className="flex items-center gap-2 text-success-500 font-medium">
                        <CheckCircle2 size={20} />
                        <span>You have already applied for this job</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      {applyStatus === 'error' && (
                        <div className="bg-error-500 bg-opacity-10 p-4 rounded-lg mb-4">
                          <div className="flex items-center gap-2 text-error-500 font-medium">
                            <AlertTriangle size={20} />
                            <span>Failed to submit application. Please try again.</span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleApply}
                        disabled={applyStatus === 'loading' || applyStatus === 'success'}
                        className="btn btn-primary w-full"
                      >
                        {applyStatus === 'loading' ? 'Submitting...' : 'Apply Now'}
                      </button>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center overflow-hidden">
                        {job.postedBy.profileImage ? (
                          <img src={job.postedBy.profileImage} alt={job.postedBy.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg font-medium">{job.postedBy.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-navy-800">{job.postedBy.name}</p>
                        <p className="text-sm text-gray-600">Recruiter at {job.company}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Similar jobs section (optional placeholder) */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-navy-800 mb-4">Similar Jobs</h2>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-navy-800 mb-1">{job.title} at Company {item}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin size={14} />
                          <span>{job.location}</span>
                        </div>
                        <Link to="#" className="text-primary-600 text-sm font-medium hover:text-primary-700">
                          View Job
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default JobDetails;
