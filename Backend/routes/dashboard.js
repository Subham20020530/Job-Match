import express from 'express';
import { auth, recruiterOnly, jobSeekerOnly } from '../middleware/auth.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

const router = express.Router();

// Get recruiter dashboard data
router.get('/recruiter', auth, recruiterOnly, async (req, res) => {
  try {
    // Get total jobs posted by recruiter
    const totalJobs = await Job.countDocuments({ postedBy: req.user._id });
    
    // Get active jobs
    const activeJobs = await Job.countDocuments({
      postedBy: req.user._id,
      $or: [
        { applicationDeadline: { $gt: new Date() } },
        { applicationDeadline: null }
      ]
    });
    
    // Get total applications
    const totalApplications = await Application.countDocuments({ recruiter: req.user._id });
    
    // Get applications by status
    const applicationStats = {
      pending: await Application.countDocuments({ recruiter: req.user._id, status: 'pending' }),
      viewed: await Application.countDocuments({ recruiter: req.user._id, status: 'viewed' }),
      shortlisted: await Application.countDocuments({ recruiter: req.user._id, status: 'shortlisted' }),
      rejected: await Application.countDocuments({ recruiter: req.user._id, status: 'rejected' }),
      hired: await Application.countDocuments({ recruiter: req.user._id, status: 'hired' })
    };
    
    // Get recent applicants
    const recentApplicants = await Application.find({ recruiter: req.user._id })
      .populate('applicant', 'name profileImage')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      totalJobs,
      activeJobs,
      totalApplications,
      shortlistedCandidates: applicationStats.shortlisted,
      newApplications: applicationStats.pending,
      applicationStats,
      recentApplicants
    });
  } catch (err) {
    console.error('Get recruiter dashboard data error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job seeker dashboard data
router.get('/jobseeker', auth, jobSeekerOnly, async (req, res) => {
  try {
    // Get applications by status
    const applicationStats = {
      total: await Application.countDocuments({ applicant: req.user._id }),
      pending: await Application.countDocuments({ applicant: req.user._id, status: 'pending' }),
      viewed: await Application.countDocuments({ applicant: req.user._id, status: 'viewed' }),
      shortlisted: await Application.countDocuments({ applicant: req.user._id, status: 'shortlisted' }),
      rejected: await Application.countDocuments({ applicant: req.user._id, status: 'rejected' }),
      hired: await Application.countDocuments({ applicant: req.user._id, status: 'hired' })
    };
    
    // Get recent applications
    const recentApplications = await Application.find({ applicant: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recommended jobs based on skills
    const user = await User.findById(req.user._id);
    const recommendedJobs = [];
    
    if (user.skills && user.skills.length > 0) {
      // Create a search query based on user skills
      const skillsQuery = user.skills.join(' ');
      
      // Find jobs that match user skills
      const matchingJobs = await Job.find({
        $text: { $search: skillsQuery },
        // Exclude jobs user already applied to
        _id: { 
          $nin: recentApplications.map(app => app.job._id) 
        }
      })
      .limit(5)
      .populate('postedBy', 'name company profileImage');
      
      recommendedJobs.push(...matchingJobs);
    }
    
    res.json({
      applicationStats,
      recentApplications,
      recommendedJobs
    });
  } catch (err) {
    console.error('Get job seeker dashboard data error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;