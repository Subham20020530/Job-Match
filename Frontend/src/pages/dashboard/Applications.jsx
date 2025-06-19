import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { API_URL } from '../../config';
import { 
  Briefcase as BriefcaseBusiness, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Eye, 
  X, 
  ChevronDown, 
  Download, 
  Mail, 
  Calendar, 
  Brain, 
  Sparkles,
  FileText,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    job: ''
  });
  const [jobs, setJobs] = useState([]);
  const [activeApplication, setActiveApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [analyzingApplication, setAnalyzingApplication] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch applications based on user role
        let applicationsRes;
        if (user?.role === 'recruiter') {
          applicationsRes = await axios.get(`${API_URL}/api/applications/recruiter`);
          
          // Fetch jobs for filter
          const jobsRes = await axios.get(`${API_URL}/api/jobs/recruiter`);
          setJobs(jobsRes.data.jobs);
        } else {
          applicationsRes = await axios.get(`${API_URL}/api/applications/user`);
        }
        
        setApplications(applicationsRes.data.applications);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
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
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Filter applications
  const filteredApplications = applications.filter(app => {
    // Status filter
    if (filters.status && app.status !== filters.status) {
      return false;
    }
    
    // Job filter (for recruiters)
    if (filters.job && app.job._id !== filters.job) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesJobTitle = app.job.title.toLowerCase().includes(searchTerm);
      const matchesCompany = app.job.company.toLowerCase().includes(searchTerm);
      const matchesApplicant = user?.role === 'recruiter' && app.applicant.name.toLowerCase().includes(searchTerm);
      
      return matchesJobTitle || matchesCompany || matchesApplicant;
    }
    
    return true;
  });
  
  // Update application status (recruiter only)
  const updateApplicationStatus = async (applicationId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/applications/${applicationId}`, 
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` // Add auth token if needed
        }
      }
    );
    
    console.log('Update response:', response.data); // Log the response
    
    setApplications(apps => 
      apps.map(app => 
        app._id === applicationId ? { ...app, status: status } : app
      )
    );
    
    if (activeApplication && activeApplication._id === applicationId) {
      setActiveApplication({ ...activeApplication, status: status });
    }
    
    return response.data; // Return the response data
  } catch (err) {
    console.error('Error updating application status:', {
      error: err,
      response: err.response?.data
    });
    throw err; // Re-throw the error for handling in the component
  }
};
  
  // Open application details
  const openApplicationDetails = (application) => {
    setActiveApplication(application);
    setShowApplicationDetails(true);
    
    // If pending, mark as viewed
    if (user?.role === 'recruiter' && application.status === 'pending') {
      updateApplicationStatus(application._id, 'viewed');
    }
  };
  
  // Close application details
  const closeApplicationDetails = () => {
    setShowApplicationDetails(false);
  };

  // Analyze single application
  const analyzeSingleApplication = async (applicationId) => {
    try {
      setAnalyzingApplication(applicationId);
      
      const response = await axios.post(`${API_URL}/api/applications/analyze/${applicationId}`);
      
      // Update application with analysis
      setApplications(apps => 
        apps.map(app => 
          app._id === applicationId 
            ? { ...app, skillAnalysis: response.data.analysis }
            : app
        )
      );
      
      // Update active application if it's the one being analyzed
      if (activeApplication && activeApplication._id === applicationId) {
        setActiveApplication({
          ...activeApplication,
          skillAnalysis: response.data.analysis
        });
      }
      
      alert('Resume analyzed successfully!');
    } catch (err) {
      console.error('Error analyzing application:', err);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzingApplication(null);
    }
  };

  // Bulk AI Evaluation for recruiters
  const evaluateWithAI = async (jobId) => {
    if (!jobId) return;
    
    try {
      setAiAnalyzing(true);
      
      const response = await axios.post(`${API_URL}/api/applications/bulk-analyze/${jobId}`);
      
      setAiResults(response.data.results);
      setShowAiModal(true);
      
      // Refresh applications to get updated analysis
      const applicationsRes = await axios.get(`${API_URL}/api/applications/recruiter`);
      setApplications(applicationsRes.data.applications);
      
    } catch (err) {
      console.error('Error evaluating candidates:', err);
      alert('Failed to evaluate candidates. Please try again.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-800 mb-2">Applications</h1>
        <p className="text-gray-600">
          {user?.role === 'recruiter' 
            ? 'Review and manage applications for your job postings.' 
            : 'Track the status of your job applications.'}
        </p>
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
              placeholder={user?.role === 'recruiter' ? "Search by job title or applicant" : "Search by job title or company"}
            />
          </div>
          
          <div className="w-full md:w-48">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="viewed">Viewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>
          
          {user?.role === 'recruiter' && jobs.length > 0 && (
            <div className="w-full md:w-64">
              <select
                name="job"
                value={filters.job}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {user?.role === 'recruiter' && filters.job && (
            <button
              onClick={() => evaluateWithAI(filters.job)}
              disabled={aiAnalyzing}
              className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              {aiAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain size={18} />
                  AI Analyze All
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Applications list */}
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
      ) : filteredApplications.length > 0 ? (
        <div className="card">
          <div className="divide-y divide-gray-200">
            {filteredApplications.map((application) => (
              <div 
                key={application._id} 
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => openApplicationDetails(application)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {user?.role === 'recruiter' ? (
                      <>
                        <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center overflow-hidden">
                          {application.applicant.profileImage ? (
                            <img 
                              src={application.applicant.profileImage} 
                              alt={application.applicant.name}
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <span className="text-lg font-medium">
                              {application.applicant.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-navy-800">{application.applicant.name}</h3>
                          <p className="text-gray-600 text-sm">
                            Applied for <span className="font-medium">{application.job.title}</span>
                          </p>
                          <p className="text-gray-500 text-sm">
                            {formatDate(application.createdAt)}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            {application.resume && (
                              <div className="flex items-center gap-1">
                                <FileText size={12} className="text-green-600" />
                                <span className="text-xs text-green-600">Resume uploaded</span>
                              </div>
                            )}
                            {application.skillAnalysis && (
                              <div className="flex items-center gap-1">
                                <Brain size={12} className="text-blue-600" />
                                <span className="text-xs text-blue-600">
                                  {application.skillAnalysis.matchPercentage}% match
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
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
                          <p className="text-gray-500 text-sm">
                            Applied on {formatDate(application.createdAt)}
                          </p>
                          {application.resume && (
                            <div className="flex items-center gap-1 mt-1">
                              <FileText size={12} className="text-green-600" />
                              <span className="text-xs text-green-600">Resume: {application.resume.filename}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`badge ${getStatusBadge(application.status)} capitalize`}>
                      {application.status}
                    </span>
                    
                    {user?.role === 'recruiter' && !application.skillAnalysis && application.resume && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          analyzeSingleApplication(application._id);
                        }}
                        disabled={analyzingApplication === application._id}
                        className="btn btn-outline text-xs py-1 px-2 flex items-center gap-1"
                      >
                        {analyzingApplication === application._id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary-600 border-t-transparent"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain size={12} />
                            Analyze
                          </>
                        )}
                      </button>
                    )}
                    
                    <button className="text-gray-400 hover:text-navy-700">
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="flex justify-center mb-4">
            {filters.status || filters.search || filters.job ? (
              <Filter size={48} className="text-gray-400" />
            ) : (
              <BriefcaseBusiness size={48} className="text-gray-400" />
            )}
          </div>
          <h3 className="text-xl font-bold text-navy-800 mb-2">
            {filters.status || filters.search || filters.job 
              ? 'No applications match your filters' 
              : 'No applications yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.status || filters.search || filters.job 
              ? 'Try adjusting your filters or search terms.' 
              : user?.role === 'recruiter' 
                ? 'Once candidates apply for your jobs, they will appear here.' 
                : 'Start applying for jobs to track your applications here.'}
          </p>
          {(filters.status || filters.search || filters.job) && (
            <button
              onClick={() => setFilters({ status: '', search: '', job: '' })}
              className="btn btn-primary mx-auto"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
      
      {/* Application details modal */}
      {showApplicationDetails && activeApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-navy-900 bg-opacity-50" onClick={closeApplicationDetails}></div>
            
            <div className="relative bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-navy-800">Application Details</h3>
                <button 
                  onClick={closeApplicationDetails}
                  className="text-gray-500 hover:text-navy-700 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  {user?.role === 'recruiter' ? (
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center overflow-hidden">
                        {activeApplication.applicant.profileImage ? (
                          <img 
                            src={activeApplication.applicant.profileImage} 
                            alt={activeApplication.applicant.name}
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <span className="text-xl font-medium">
                            {activeApplication.applicant.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-navy-800">{activeApplication.applicant.name}</h2>
                        <p className="text-gray-600">{activeApplication.applicant.title || 'Job Seeker'}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold text-navy-800">{activeApplication.job.title}</h2>
                      <p className="text-gray-600">{activeApplication.job.company}</p>
                    </div>
                  )}
                  
                  <span className={`badge ${getStatusBadge(activeApplication.status)} capitalize`}>
                    {activeApplication.status}
                  </span>
                </div>

                {/* Skill Analysis Section */}
                {activeApplication.skillAnalysis && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain size={20} className="text-blue-600" />
                      <h3 className="font-medium text-navy-800">AI Skill Analysis</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {activeApplication.skillAnalysis.matchPercentage}%
                        </div>
                        <div className="text-sm text-gray-600">Match Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {activeApplication.skillAnalysis.matchedSkills?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Matched Skills</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {activeApplication.skillAnalysis.missingSkills?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Missing Skills</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className={`badge ${
                        activeApplication.skillAnalysis.recommendation === 'Recommended' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {activeApplication.skillAnalysis.recommendation}
                      </span>
                    </div>
                    
                    {activeApplication.skillAnalysis.matchedSkills?.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-medium text-navy-800 mb-2">Matched Skills:</h4>
                        <div className="flex flex-wrap gap-1">
                          {activeApplication.skillAnalysis.matchedSkills.map((skill, index) => (
                            <span key={index} className="badge bg-green-100 text-green-800 text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {activeApplication.skillAnalysis.missingSkills?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-navy-800 mb-2">Missing Skills:</h4>
                        <div className="flex flex-wrap gap-1">
                          {activeApplication.skillAnalysis.missingSkills.map((skill, index) => (
                            <span key={index} className="badge bg-red-100 text-red-800 text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="font-medium text-navy-800 mb-2">
                    {user?.role === 'recruiter' ? 'About the Applicant' : 'Job Description'}
                  </h3>
                  {user?.role === 'recruiter' ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        {activeApplication.applicant.about || 'No description provided.'}
                      </p>
                      
                      <div className="flex flex-col gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-500" />
                          <span className="text-navy-700">{activeApplication.applicant.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-navy-700">Applied on {formatDate(activeApplication.createdAt)}</span>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-navy-800 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {activeApplication.applicant.skills && activeApplication.applicant.skills.length > 0 ? (
                          activeApplication.applicant.skills.map((skill, index) => (
                            <span key={index} className="badge badge-gray">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-600">No skills listed</p>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-navy-800 mb-2">Experience</h3>
                      {activeApplication.applicant.experience && activeApplication.applicant.experience.length > 0 ? (
                        <div className="space-y-3 mb-6">
                          {activeApplication.applicant.experience.map((exp, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="font-medium text-navy-800">{exp.title}</h4>
                              <p className="text-gray-600">{exp.company}</p>
                              <p className="text-sm text-gray-500">
                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </p>
                              {exp.description && (
                                <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 mb-6">No experience listed</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-600 mb-4">
                      {activeApplication.job.description}
                    </p>
                  )}
                </div>

                {/* Cover Letter */}
                {activeApplication.coverLetter && (
                  <div className="mb-6">
                    <h3 className="font-medium text-navy-800 mb-2">Cover Letter</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-navy-700">{activeApplication.coverLetter}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex flex-wrap gap-3">
                  {user?.role === 'recruiter' && (
                    <>
                      {activeApplication.resume && (
                        <a
                          href={activeApplication.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline text-sm gap-2"
                        >
                          <Download size={16} />
                          Download Resume
                        </a>
                      )}
                      
                      <a
                        href={`mailto:${activeApplication.applicant.email}`}
                        className="btn btn-outline text-sm gap-2"
                      >
                        <Mail size={16} />
                        Contact
                      </a>

                      {!activeApplication.skillAnalysis && activeApplication.resume && (
                        <button
                          onClick={() => analyzeSingleApplication(activeApplication._id)}
                          disabled={analyzingApplication === activeApplication._id}
                          className="btn btn-outline text-sm gap-2"
                        >
                          {analyzingApplication === activeApplication._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Brain size={16} />
                              Analyze Resume
                            </>
                          )}
                        </button>
                      )}
                      
                      {activeApplication.status !== 'shortlisted' && (
                        <button 
                          onClick={() => updateApplicationStatus(activeApplication._id, 'shortlisted')} 
                          className="btn btn-primary text-sm gap-2"
                        >
                          <CheckCircle2 size={16} />
                          Shortlist
                        </button>
                      )}
                      
                      {activeApplication.status !== 'rejected' && (
                        <button 
                          onClick={() => updateApplicationStatus(activeApplication._id, 'rejected')} 
                          className="btn btn-outline text-sm gap-2 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X size={16} />
                          Reject
                        </button>
                      )}
                      
                      {activeApplication.status !== 'hired' && (
                        <button 
                          onClick={() => updateApplicationStatus(activeApplication._id, 'hired')} 
                          className="btn btn-outline text-sm gap-2 border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle2 size={16} />
                          Hire
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Evaluation Results Modal */}
      {showAiModal && aiResults && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-navy-900 bg-opacity-50" onClick={() => setShowAiModal(false)}></div>
            
            <div className="relative bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Sparkles size={24} className="text-primary-600" />
                  <h3 className="text-lg font-bold text-navy-800">AI Bulk Analysis Results</h3>
                </div>
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="text-gray-500 hover:text-navy-700 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-medium text-navy-800 mb-2">Job: {aiResults.job_title}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{aiResults.total_candidates}</div>
                      <div className="text-sm text-gray-600">Total Candidates</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{aiResults.recommended_count}</div>
                      <div className="text-sm text-gray-600">Recommended</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{aiResults.not_recommended_count}</div>
                      <div className="text-sm text-gray-600">Not Recommended</div>
                    </div>
                  </div>
                </div>

                {aiResults.recommended && aiResults.recommended.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-navy-800 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-green-600" />
                      Recommended Candidates ({aiResults.recommended.length})
                    </h4>
                    <div className="space-y-3">
                      {aiResults.recommended.map((candidate, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-navy-800">{candidate.candidate_name}</h5>
                            <span className="badge bg-green-100 text-green-800">
                              Score: {candidate.match_percentage}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{candidate.candidate_email}</p>
                          
                          {candidate.matched_skills && candidate.matched_skills.length > 0 && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Matched Skills: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {candidate.matched_skills.map((skill, idx) => (
                                  <span key={idx} className="badge bg-green-100 text-green-800 text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {candidate.missing_skills && candidate.missing_skills.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Missing Skills: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {candidate.missing_skills.map((skill, idx) => (
                                  <span key={idx} className="badge bg-red-100 text-red-800 text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiResults.not_recommended && aiResults.not_recommended.length > 0 && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-3 flex items-center gap-2">
                      <X size={18} className="text-red-600" />
                      Not Recommended ({aiResults.not_recommended.length})
                    </h4>
                    <div className="space-y-3">
                      {aiResults.not_recommended.map((candidate, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-navy-800">{candidate.candidate_name}</h5>
                            <span className="badge bg-red-100 text-red-800">
                              Score: {candidate.match_percentage}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{candidate.candidate_email}</p>
                          
                          {candidate.missing_skills && candidate.missing_skills.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Missing Skills: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {candidate.missing_skills.map((skill, idx) => (
                                  <span key={idx} className="badge bg-red-100 text-red-800 text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This AI evaluation is based on resume analysis and job requirements matching. 
                    Please use this as a guide alongside your professional judgment for final hiring decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;