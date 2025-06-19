import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    jobType: 'Full-time',
    description: '',
    requirements: '',
    salary: '',
    experienceLevel: 'Mid Level',
    skills: '',
    applicationDeadline: '',
    sector: 'Technology'
  });
  const [formStatus, setFormStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormStatus('loading');
      
      // Convert form data to the proper format
      const jobData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(req => req.trim() !== ''),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
      };
      
      await axios.post(`${API_URL}/api/jobs`, jobData);
      
      setFormStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/dashboard/manage-jobs');
      }, 2000);
    } catch (err) {
      setFormStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to create job listing. Please try again.');
      console.error('Error creating job:', err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-800 mb-2">Post a New Job</h1>
        <p className="text-gray-600">
          Fill out the form below to create a new job listing and find the perfect candidates.
        </p>
      </div>
      
      {formStatus === 'success' && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 flex items-start">
          <CheckCircle2 size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Job posted successfully!</p>
            <p>Redirecting to your job listings...</p>
          </div>
        </div>
      )}
      
      {formStatus === 'error' && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Failed to post job</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-navy-700 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>
          
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-navy-700 mb-1">
              Job Sector *
            </label>
            <select
              id="sector"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="input-field"
              required
            >
              {jobSectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-navy-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. San Francisco, CA (or Remote)"
              required
            />
          </div>
          
          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-navy-700 mb-1">
              Job Type *
            </label>
            <select
              id="jobType"
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-navy-700 mb-1">
              Salary Range
            </label>
            <input
              type="text"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. $80,000 - $100,000"
            />
          </div>
          
          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-navy-700 mb-1">
              Experience Level *
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior">Senior</option>
              <option value="Director">Director</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-navy-700 mb-1">
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="input-field"
              placeholder="Provide a detailed description of the job role, responsibilities, and company information."
              required
            ></textarea>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="requirements" className="block text-sm font-medium text-navy-700 mb-1">
              Requirements *
            </label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={6}
              className="input-field"
              placeholder="List the requirements for this position (one per line). For example:
- 3+ years of experience with React
- Bachelor's degree in Computer Science or related field
- Strong communication skills"
              required
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              Add one requirement per line.
            </p>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="skills" className="block text-sm font-medium text-navy-700 mb-1">
              Required Skills *
            </label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. JavaScript, React, Node.js, SQL"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate skills with commas.
            </p>
          </div>
          
          <div>
            <label htmlFor="applicationDeadline" className="block text-sm font-medium text-navy-700 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              id="applicationDeadline"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/manage-jobs')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={formStatus === 'loading'}
            className="btn btn-primary"
          >
            {formStatus === 'loading' ? 'Posting Job...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;