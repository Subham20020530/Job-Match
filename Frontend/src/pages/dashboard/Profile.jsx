import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { API_URL } from '../../config';
import { 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Briefcase,
  Calendar,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  FileText,
  Download
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [imageUploadError, setImageUploadError] = useState('');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/users/profile`);
        setProfile(res.data.profile);
        setFormData(res.data.profile);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill.trim()]
    }));
    
    setNewSkill('');
  };
  
  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          school: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          current: false
        }
      ]
    }));
  };
  
  const handleEducationChange = (index, field, value) => {
    setFormData(prev => {
      const updatedEducation = [...(prev.education || [])];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value
      };
      return { ...prev, education: updatedEducation };
    });
  };
  
  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleAddExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        {
          company: '',
          title: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        }
      ]
    }));
  };
  
  const handleExperienceChange = (index, field, value) => {
    setFormData(prev => {
      const updatedExperience = [...(prev.experience || [])];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value
      };
      return { ...prev, experience: updatedExperience };
    });
  };
  
  const handleRemoveExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file');
      return;
    }
    
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('upload_preset', 'JobMatch');
    
    try {
      setUploadingImage(true);
      setImageUploadError('');
      
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/subham2002/image/upload',
        {
          method: 'POST',
          body: formDataUpload,
        }
      );
      
      const data = await response.json();
      
      if (data && data.secure_url) {
        setFormData(prev => ({
          ...prev,
          profileImage: data.secure_url
        }));
        
        // If not in editing mode, save immediately
        if (!isEditing) {
          try {
            const updateRes = await axios.put(`${API_URL}/api/users/profile`, {
              profileImage: data.secure_url
            });
            setProfile(updateRes.data.profile);
          } catch (err) {
            console.error('Error updating profile image:', err);
            setImageUploadError('Failed to save profile image');
          }
        }
      } else {
        throw new Error('Invalid response from image upload service');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setImageUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaveStatus('loading');
      const res = await axios.put(`${API_URL}/api/users/profile`, formData);
      setProfile(res.data.profile);
      setIsEditing(false);
      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setSaveStatus('error');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="card p-6">
          <div className="flex gap-6">
            <div className="h-24 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy-800">Edit Profile</h1>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(profile || {});
                setImageUploadError('');
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saveStatus === 'loading'}
              className="btn btn-primary"
            >
              {saveStatus === 'loading' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        {saveStatus === 'error' && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>Failed to update profile. Please try again.</span>
          </div>
        )}
        
        <form>
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold text-navy-800 mb-4">Profile Image</h2>
            
            {imageUploadError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-start">
                <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                <span>{imageUploadError}</span>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative group">
                <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {formData.profileImage ? (
                    <img 
                      src={formData.profileImage} 
                      alt={formData.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-primary-600" />
                  )}
                  
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                
                {/* Upload button positioned outside the image */}
                <label 
                  htmlFor="profile-image" 
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg border-2 border-white"
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Upload size={18} />
                  )}
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-navy-800 mb-2">
                  {uploadingImage ? 'Uploading...' : 'Upload a new photo'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  JPG, PNG or GIF. Max 5MB. Click the upload button or hover over your current photo to change it.
                </p>
              </div>
            </div>
          </div>

          
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold text-navy-800 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-navy-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="input-field bg-gray-50"
                  required
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-navy-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g. Software Engineer"
                />
              </div>
              
              {user?.role === 'recruiter' && (
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-navy-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company || ''}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-navy-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-navy-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g. (123) 456-7890"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="website" className="block text-sm font-medium text-navy-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g. https://yourwebsite.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="about" className="block text-sm font-medium text-navy-700 mb-1">
                  About
                </label>
                <textarea
                  id="about"
                  name="about"
                  value={formData.about || ''}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  placeholder="Write a short bio or summary about yourself"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold text-navy-800 mb-4">Skills</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {(formData.skills || []).map((skill, index) => (
                <div key={index} className="badge badge-gray flex items-center gap-1">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {(formData.skills || []).length === 0 && (
                <p className="text-gray-500 text-sm">
                  No skills added yet. Add some skills to showcase your expertise.
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="input-field"
                placeholder="Add a skill (e.g. JavaScript, Project Management)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn btn-primary whitespace-nowrap"
              >
                Add Skill
              </button>
            </div>
          </div>
          
          {user?.role === 'jobseeker' && (
            <>
              <div className="card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-navy-800">Experience</h2>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="btn btn-outline text-sm py-1.5"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Experience
                  </button>
                </div>
                
                {(formData.experience || []).length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No experience added yet. Add your work experience to showcase your career history.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {(formData.experience || []).map((exp, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-navy-800">
                            Experience #{index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(index)}
                            className="text-gray-500 hover:text-red-500 focus:outline-none"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-1">
                              Company
                            </label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                              className="input-field"
                              placeholder="Company name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-1">
                              Job Title
                            </label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                              className="input-field"
                              placeholder="Job title"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                              className="input-field"
                              placeholder="Location"
                            />
                          </div>
                          
                          <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-navy-700 mb-1">
                                Start Date
                              </label>
                              <input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                className="input-field"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-navy-700 mb-1">
                                End Date
                              </label>
                              <input
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                className="input-field"
                                disabled={exp.current}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-navy-700">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                                className="rounded text-primary-600 focus:ring-primary-500"
                              />
                              I currently work here
                            </label>
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-navy-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={exp.description || ''}
                              onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                              rows={3}
                              className="input-field"
                              placeholder="Describe your responsibilities and achievements"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-navy-800">Education</h2>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="btn btn-outline text-sm py-1.5"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Education
                  </button>
                </div>
                
                {(formData.education || []).length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No education added yet. Add your educational background to complete your profile.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {(formData.education || []).map((edu, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-navy-800">
                            Education #{index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(index)}
                            className="text-gray-500 hover:text-red-500 focus:outline-none"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-1">
                              School
                            </label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                              className="input-field"
                              placeholder="School/University name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-navy-700 mb-1">
                              Degree
                            </label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                              className="input-field"
                              placeholder="e.g. Bachelor's, Master's"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-navy-700 mb-1">
                              Field of Study
                            </label>
                            <input
                              type="text"
                              value={edu.field}
                              onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                              className="input-field"
                              placeholder="e.g. Computer Science"
                            />
                          </div>
                          
                          <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-navy-700 mb-1">
                                Start Date
                              </label>
                              <input
                                type="month"
                                value={edu.startDate}
                                onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                                className="input-field"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-navy-700 mb-1">
                                End Date
                              </label>
                              <input
                                type="month"
                                value={edu.endDate}
                                onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                                className="input-field"
                                disabled={edu.current}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-navy-700">
                              <input
                                type="checkbox"
                                checked={edu.current}
                                onChange={(e) => handleEducationChange(index, 'current', e.target.checked)}
                                className="rounded text-primary-600 focus:ring-primary-500"
                              />
                              I am currently studying here
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(profile || {});
                setImageUploadError('');
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saveStatus === 'loading'}
              className="btn btn-primary"
            >
              {saveStatus === 'loading' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy-800">Profile</h1>
        
        <button
          onClick={() => setIsEditing(true)}
          className="btn btn-primary"
        >
          Edit Profile
        </button>
      </div>
      
      {saveStatus === 'success' && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6 flex items-start">
          <CheckCircle2 size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>Profile updated successfully!</span>
        </div>
      )}
      
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 relative">
            <div className="h-24 w-24 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center overflow-hidden">
              {profile?.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt={profile.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={32} />
              )}
            </div>
            
            {/* Quick upload button */}
            <label 
              htmlFor="quick-profile-image" 
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg border-2 border-white"
            >
              {uploadingImage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Camera size={14} />
              )}
              <input
                type="file"
                id="quick-profile-image"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-navy-800 mb-1">{profile?.name}</h2>
            <p className="text-navy-600 mb-3">
              {profile?.title || (profile?.role === 'recruiter' ? 'Recruiter' : 'Job Seeker')}
              {profile?.company && ` at ${profile.company}`}
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-y-2 gap-x-4 text-gray-600 mb-4">
              {profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  <span>{profile.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                <span>{profile?.email}</span>
              </div>
              
              {profile?.website && (
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-gray-500" />
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
            
            {profile?.about && (
              <p className="text-navy-700">
                {profile.about}
              </p>
            )}
          </div>
        </div>
        
        {imageUploadError && (
          <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{imageUploadError}</span>
          </div>
        )}
      </div>
      
      {profile?.skills && profile.skills.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-navy-800 mb-4">Skills</h2>
          
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span key={index} className="badge badge-teal">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {profile?.role === 'jobseeker' && (
        <>
          {profile.experience && profile.experience.length > 0 && (
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-bold text-navy-800 mb-4">Experience</h2>
              
              <div className="space-y-6">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-navy-800">{exp.title}</h3>
                        <p className="text-navy-600">{exp.company}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600 text-sm mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                              {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                            </span>
                          </div>
                          {exp.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{exp.location}</span>
                            </div>
                          )}
                        </div>
                        {exp.description && (
                          <p className="text-navy-700 mt-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {profile.education && profile.education.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-navy-800 mb-4">Education</h2>
              
              <div className="space-y-6">
                {profile.education.map((edu, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center">
                        <Building size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-navy-800">{edu.school}</h3>
                        <p className="text-navy-600">
                          {edu.degree} in {edu.field}
                        </p>
                        <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                          <Calendar size={14} />
                          <span>
                            {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;