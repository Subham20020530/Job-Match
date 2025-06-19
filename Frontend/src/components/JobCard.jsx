import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, DollarSign } from 'lucide-react';

const JobCard = ({ job }) => {
  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Calculate how long ago the job was posted
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

  return (
    <div className="card hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-primary-100 text-primary-700 flex items-center justify-center">
              {job.postedBy.profileImage ? (
                <img 
                  src={job.postedBy.profileImage} 
                  alt={job.company}
                  className="h-12 w-12 rounded-md object-cover" 
                />
              ) : (
                <span className="text-lg font-bold">
                  {job.company.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-navy-800">{job.title}</h3>
              <p className="text-gray-600">{job.company}</p>
            </div>
          </div>
          <span className="badge badge-blue whitespace-nowrap">
            {job.jobType}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{job.location}</span>
          </div>
          
          {job.salary && (
            <div className="flex items-center gap-1">
              <DollarSign size={16} />
              <span>{job.salary}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{getTimeAgo(job.createdAt)}</span>
          </div>
          
          {job.applicationDeadline && (
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Deadline: {formatDate(job.applicationDeadline)}</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <p className="text-navy-700 line-clamp-2">
            {job.description}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="badge badge-gray">
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="badge badge-gray">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Experience: {job.experienceLevel}
          </span>
          
          <Link 
            to={`/jobs/${job._id}`}
            className="btn btn-primary text-sm py-1.5"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;