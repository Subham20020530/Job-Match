import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import { Search, MapPin, Filter, Briefcase as BriefcaseBusiness, X, AlertCircle, ChevronDown } from 'lucide-react';

const Jobs = () => {
  const navigate = useNavigate();
  const { jobs, loading, error, totalJobs, totalPages, currentPage, fetchJobs } = useJobs();
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    sector: '',
    page: 1
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  const jobSectors = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Sales',
    'Engineering',
    'Design',
    'Human Resources',
    'Operations',
    'Customer Service',
    'Manufacturing',
    'Retail',
    'Hospitality',
    'Legal',
    'Consulting',
    'Real Estate',
    'Media & Communications',
    'Non-Profit',
    'Government'
  ];
  
  // Apply filters from URL params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters = {
      search: urlParams.get('search') || '',
      location: urlParams.get('location') || '',
      jobType: urlParams.get('jobType') || '',
      experienceLevel: urlParams.get('experienceLevel') || '',
      sector: urlParams.get('sector') || '',
      page: parseInt(urlParams.get('page')) || 1
    };
    
    setFilters(initialFilters);
    fetchJobs(initialFilters);
  }, []);
  
  // Apply filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Apply filters
  const applyFilters = (e) => {
    if (e) e.preventDefault();
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    fetchJobs(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && key !== 'page') params.append(key, value);
    });
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  };
  
  // Reset filters
  const resetFilters = () => {
    const resetFilters = {
      search: '',
      location: '',
      jobType: '',
      experienceLevel: '',
      sector: '',
      page: 1
    };
    setFilters(resetFilters);
    fetchJobs(resetFilters);
    window.history.replaceState({}, '', window.location.pathname);
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchJobs(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Toggle filter sidebar on mobile
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    // In a real app, you would pass this to fetchJobs
    console.log('Sorting by:', e.target.value);
  };

  // Quick filter buttons
  const quickFilters = [
    { label: 'Remote', type: 'jobType', value: 'Remote' },
    { label: 'Full-time', type: 'jobType', value: 'Full-time' },
    { label: 'Technology', type: 'sector', value: 'Technology' },
    { label: 'Entry Level', type: 'experienceLevel', value: 'Entry Level' },
  ];

  const applyQuickFilter = (type, value) => {
    const newFilters = { ...filters, [type]: value, page: 1 };
    setFilters(newFilters);
    fetchJobs(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val && key !== 'page') params.append(key, val);
    });
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  };

  const hasActiveFilters = filters.search || filters.location || filters.jobType || filters.experienceLevel || filters.sector;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50">
        {/* Page header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-navy-800 mb-4">Find Your Perfect Job</h1>
            
            {/* Search form */}
            <form onSubmit={applyFilters} className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="pl-10 input-field"
                  placeholder="Job title, keywords, or company"
                />
              </div>
              
              <div className="md:w-64 relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="pl-10 input-field"
                  placeholder="Location"
                />
              </div>
              
              <button type="submit" className="btn btn-primary">
                Search Jobs
              </button>
              
              <button
                type="button"
                className="md:hidden btn btn-outline flex items-center gap-2"
                onClick={toggleFilter}
              >
                <Filter size={18} />
                Filters
                {hasActiveFilters && (
                  <span className="bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
            </form>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => applyQuickFilter(filter.type, filter.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters[filter.type] === filter.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
              
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filter sidebar - desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-navy-800">Filters</h2>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Reset
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {/* Job Sector */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Job Sector
                    </label>
                    <div className="relative">
                      <select
                        name="sector"
                        value={filters.sector}
                        onChange={handleFilterChange}
                        className="input-field appearance-none pr-8"
                      >
                        <option value="">All Sectors</option>
                        {jobSectors.map((sector) => (
                          <option key={sector} value={sector}>
                            {sector}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                  
                  {/* Job Type */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Job Type
                    </label>
                    <div className="relative">
                      <select
                        name="jobType"
                        value={filters.jobType}
                        onChange={handleFilterChange}
                        className="input-field appearance-none pr-8"
                      >
                        <option value="">All Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Remote">Remote</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                  
                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Experience Level
                    </label>
                    <div className="relative">
                      <select
                        name="experienceLevel"
                        value={filters.experienceLevel}
                        onChange={handleFilterChange}
                        className="input-field appearance-none pr-8"
                      >
                        <option value="">All Levels</option>
                        <option value="Entry Level">Entry Level</option>
                        <option value="Mid Level">Mid Level</option>
                        <option value="Senior">Senior</option>
                        <option value="Director">Director</option>
                        <option value="Executive">Executive</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => applyFilters()}
                    className="btn btn-primary w-full"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filter sidebar - mobile */}
            {isFilterOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div className="absolute inset-0 bg-navy-900 bg-opacity-50" onClick={toggleFilter}></div>
                <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-bold text-navy-800">Filters</h2>
                      <button
                        type="button"
                        onClick={toggleFilter}
                        className="text-navy-700"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Job Sector */}
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                          Job Sector
                        </label>
                        <div className="relative">
                          <select
                            name="sector"
                            value={filters.sector}
                            onChange={handleFilterChange}
                            className="input-field appearance-none pr-8"
                          >
                            <option value="">All Sectors</option>
                            {jobSectors.map((sector) => (
                              <option key={sector} value={sector}>
                                {sector}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                        </div>
                      </div>
                      
                      {/* Job Type */}
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                          Job Type
                        </label>
                        <div className="relative">
                          <select
                            name="jobType"
                            value={filters.jobType}
                            onChange={handleFilterChange}
                            className="input-field appearance-none pr-8"
                          >
                            <option value="">All Types</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                            <option value="Remote">Remote</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                        </div>
                      </div>
                      
                      {/* Experience Level */}
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                          Experience Level
                        </label>
                        <div className="relative">
                          <select
                            name="experienceLevel"
                            value={filters.experienceLevel}
                            onChange={handleFilterChange}
                            className="input-field appearance-none pr-8"
                          >
                            <option value="">All Levels</option>
                            <option value="Entry Level">Entry Level</option>
                            <option value="Mid Level">Mid Level</option>
                            <option value="Senior">Senior</option>
                            <option value="Director">Director</option>
                            <option value="Executive">Executive</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            applyFilters();
                            toggleFilter();
                          }}
                          className="btn btn-primary w-full"
                        >
                          Apply Filters
                        </button>
                        
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={() => {
                              resetFilters();
                              toggleFilter();
                            }}
                            className="btn btn-outline w-full"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Jobs list */}
            <div className="flex-1">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start">
                  <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-gray-600">
                    {loading ? 'Searching...' : `Showing ${jobs.length} of ${totalJobs} jobs`}
                  </p>
                  {hasActiveFilters && (
                    <p className="text-sm text-primary-600 mt-1">
                      Filters applied - {Object.values(filters).filter(v => v && v !== 1).length} active
                    </p>
                  )}
                </div>
                
                <div className="w-full md:w-auto">
                  <div className="relative">
                    <select
                      className="input-field w-full md:w-auto appearance-none pr-8"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="relevance">Most Relevant</option>
                      <option value="salary-high">Salary: High to Low</option>
                      <option value="salary-low">Salary: Low to High</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="card p-6 animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-14"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-6">
                  {jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-navy-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          Previous
                        </button>
                        
                        {/* Page numbers */}
                        {(() => {
                          const pages = [];
                          const maxVisible = 5;
                          let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                          let end = Math.min(totalPages, start + maxVisible - 1);
                          
                          if (end - start + 1 < maxVisible) {
                            start = Math.max(1, end - maxVisible + 1);
                          }
                          
                          for (let i = start; i <= end; i++) {
                            pages.push(i);
                          }
                          
                          return pages.map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-md transition-colors ${
                                currentPage === page
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white text-navy-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          ));
                        })()}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-navy-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <BriefcaseBusiness size={48} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-800 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-6">
                    {hasActiveFilters 
                      ? "We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms."
                      : "No jobs are currently available. Check back later for new opportunities."
                    }
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="btn btn-primary mx-auto"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Jobs;