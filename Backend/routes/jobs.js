import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, recruiterOnly } from '../middleware/auth.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

const router = express.Router();

router.get('/recruiter', auth, recruiterOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ jobs });
  } catch (err) {
    console.error('Get recruiter jobs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all jobs with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }
    
    if (req.query.experienceLevel) {
      query.experienceLevel = req.query.experienceLevel;
    }
    
    if (req.query.sector) {
      query.sector = req.query.sector;
    }
    
    const jobs = await Job.find(query)
      .populate('postedBy', 'name company profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalJobs = await Job.countDocuments(query);
    
    res.json({
      jobs,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name company profileImage');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({ job });
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new job
router.post(
  '/',
  auth,
  recruiterOnly,
  [
    body('title').notEmpty().withMessage('Job title is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('jobType').isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'])
      .withMessage('Invalid job type'),
    body('experienceLevel').isIn(['Entry Level', 'Mid Level', 'Senior', 'Director', 'Executive'])
      .withMessage('Invalid experience level'),
    body('description').notEmpty().withMessage('Description is required'),
    body('requirements').isArray().withMessage('Requirements must be an array'),
    body('skills').isArray().withMessage('Skills must be an array'),
    body('sector').isIn([
      'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Sales',
      'Engineering', 'Design', 'Human Resources', 'Operations', 'Customer Service',
      'Manufacturing', 'Retail', 'Hospitality', 'Legal', 'Consulting', 'Real Estate',
      'Media & Communications', 'Non-Profit', 'Government'
    ]).withMessage('Invalid sector')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const {
        title, location, jobType, description, requirements, salary,
        experienceLevel, skills, sector, applicationDeadline
      } = req.body;
      
      const newJob = new Job({
        title,
        company: req.user.company || req.user.name,
        location,
        jobType,
        description,
        requirements,
        salary,
        experienceLevel,
        skills,
        sector,
        applicationDeadline,
        postedBy: req.user._id
      });
      
      await newJob.save();
      res.status(201).json({ job: newJob });
    } catch (err) {
      console.error('Create job error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update job
router.put('/:id', auth, recruiterOnly, async (req, res) => {
  try {
    const allowedUpdates = [
      'title', 'location', 'jobType', 'description', 'requirements',
      'salary', 'experienceLevel', 'skills', 'sector', 'applicationDeadline'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    res.json({ job: updatedJob });
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job
router.delete('/:id', auth, recruiterOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    
    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });
    
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
