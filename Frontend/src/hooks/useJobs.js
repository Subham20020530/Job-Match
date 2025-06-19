import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchJobs = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.location) queryParams.append('location', params.location);
      if (params.jobType) queryParams.append('jobType', params.jobType);
      if (params.experienceLevel) queryParams.append('experienceLevel', params.experienceLevel);
      
      const page = params.page || 1;
      const limit = params.limit || 10;
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      const response = await axios.get(`${API_URL}/api/jobs?${queryParams.toString()}`);
      
      setJobs(response.data.jobs);
      setTotalJobs(response.data.totalJobs);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/api/jobs/${id}`);
      return response.data.job;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
      console.error('Error fetching job details:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    totalJobs,
    totalPages,
    currentPage,
    fetchJobs,
    fetchJobById
  };
};