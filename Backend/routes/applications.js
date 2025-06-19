import express from 'express';
import { auth, jobSeekerOnly, recruiterOnly } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import FormData from 'form-data';
import fetch from 'node-fetch';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'subham2002',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for resume uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resumes',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx'],
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
  }
});

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// Helper function to call AI service
async function analyzeResumeSkills(resumeUrl, requiredSkills, candidateName, jobTitle) {
  try {
    // Download the resume file
    const resumeResponse = await fetch(resumeUrl);
    if (!resumeResponse.ok) {
      throw new Error('Failed to download resume');
    }
    
    const resumeBuffer = await resumeResponse.buffer();
    
    // Create form data for AI service
    const formData = new FormData();
    formData.append('resume', resumeBuffer, 'resume.pdf');
    formData.append('required_skills', requiredSkills.join(', '));
    formData.append('candidate_name', candidateName);
    formData.append('job_title', jobTitle);
    
    // Call AI service
    const aiResponse = await fetch(`${AI_SERVICE_URL}/match-skills`, {
      method: 'POST',
      body: formData,
    });
    
    if (!aiResponse.ok) {
      throw new Error('AI service request failed');
    }
    
    return await aiResponse.json();
  } catch (error) {
    console.error('Error analyzing resume skills:', error);
    return null;
  }
}

// Create new application with resume
router.post('/', auth, jobSeekerOnly, upload.single('resume'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if job is still open
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }
    
    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    // Create application with resume
    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      recruiter: job.postedBy,
      resume: {
        url: req.file.path,
        filename: req.file.originalname,
        uploadedAt: new Date()
      },
      coverLetter,
      status: 'pending'
    });
    
    await application.save();
    
    // Analyze resume skills in background (don't wait for it)
    if (job.skills && job.skills.length > 0) {
      analyzeResumeSkills(
        req.file.path,
        job.skills,
        req.user.name,
        job.title
      ).then(analysis => {
        if (analysis) {
          Application.findByIdAndUpdate(application._id, {
            skillAnalysis: {
              extractedSkills: analysis.total_resume_skills || [],
              matchPercentage: analysis.match_percentage || 0,
              matchedSkills: analysis.matched_skills || [],
              missingSkills: analysis.missing_skills || [],
              recommendation: analysis.recommendation || 'Unknown',
              analyzedAt: new Date()
            }
          }).catch(err => console.error('Error saving skill analysis:', err));
        }
      }).catch(err => console.error('Error in background skill analysis:', err));
    }
    
    res.status(201).json({ 
      message: 'Application submitted successfully',
      application: {
        _id: application._id,
        status: application.status,
        resume: application.resume,
        createdAt: application.createdAt
      }
    });
  } catch (err) {
    console.error('Create application error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
    }
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Get user's applications
router.get('/user', auth, jobSeekerOnly, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });
    
    res.json({ applications });
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for recruiter's jobs
router.get('/recruiter', auth, recruiterOnly, async (req, res) => {
  try {
    const applications = await Application.find({ recruiter: req.user._id })
      .populate('job')
      .populate('applicant', 'name email profileImage title skills experience education')
      .sort({ createdAt: -1 });
    
    res.json({ applications });
  } catch (err) {
    console.error('Get recruiter applications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user has applied for job
router.get('/check/:jobId', auth, jobSeekerOnly, async (req, res) => {
  try {
    const application = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id
    });
    
    res.json({ hasApplied: !!application });
  } catch (err) {
    console.error('Check application error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (recruiter only)
router.put('/:id', auth, recruiterOnly, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    // Find application
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if recruiter owns the job posting
    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }
    
    // Update application
    application.status = status || application.status;
    if (notes) application.notes = notes;
    
    await application.save();
    
    res.json({ application });
  } catch (err) {
    console.error('Update application error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Analyze single application resume
router.post('/analyze/:id', auth, recruiterOnly, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', 'name');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if recruiter owns the job posting
    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to analyze this application' });
    }
    
    if (!application.resume || !application.resume.url) {
      return res.status(400).json({ message: 'No resume found for this application' });
    }
    
    // Analyze resume skills
    const analysis = await analyzeResumeSkills(
      application.resume.url,
      application.job.skills || [],
      application.applicant.name,
      application.job.title
    );
    
    if (!analysis) {
      return res.status(500).json({ message: 'Failed to analyze resume' });
    }
    
    // Save analysis to application
    application.skillAnalysis = {
      extractedSkills: analysis.total_resume_skills || [],
      matchPercentage: analysis.match_percentage || 0,
      matchedSkills: analysis.matched_skills || [],
      missingSkills: analysis.missing_skills || [],
      recommendation: analysis.recommendation || 'Unknown',
      analyzedAt: new Date()
    };
    
    await application.save();
    
    res.json({
      message: 'Resume analyzed successfully',
      analysis: application.skillAnalysis
    });
  } catch (err) {
    console.error('Analyze application error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk analyze applications for a job
router.post('/bulk-analyze/:jobId', auth, recruiterOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if recruiter owns the job posting
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to analyze applications for this job' });
    }
    
    // Get all applications for this job
    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email skills');
    
    if (applications.length === 0) {
      return res.status(400).json({ message: 'No applications found for this job' });
    }
    
    // Prepare candidates data for bulk analysis
    const candidates = applications.map(app => ({
      id: app._id.toString(),
      name: app.applicant.name,
      email: app.applicant.email,
      skills: app.applicant.skills || [],
      resume_text: '', // We'll extract this from resume if needed
    }));
    
    // Call AI service for bulk analysis
    try {
      const aiResponse = await fetch(`${AI_SERVICE_URL}/bulk-match-skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidates: candidates,
          required_skills: job.skills || [],
          job_title: job.title
        }),
      });
      
      if (!aiResponse.ok) {
        throw new Error('AI service request failed');
      }
      
      const bulkAnalysis = await aiResponse.json();
      
      // Update applications with analysis results
      const updatePromises = bulkAnalysis.all_results.map(async (result) => {
        if (result.candidate_id && !result.error) {
          await Application.findByIdAndUpdate(result.candidate_id, {
            skillAnalysis: {
              extractedSkills: result.total_resume_skills || [],
              matchPercentage: result.match_percentage || 0,
              matchedSkills: result.matched_skills || [],
              missingSkills: result.missing_skills || [],
              recommendation: result.recommendation || 'Unknown',
              analyzedAt: new Date()
            }
          });
        }
      });
      
      await Promise.all(updatePromises);
      
      res.json({
        message: 'Bulk analysis completed successfully',
        results: bulkAnalysis
      });
      
    } catch (aiError) {
      console.error('AI service error:', aiError);
      res.status(500).json({ message: 'Failed to analyze applications with AI service' });
    }
    
  } catch (err) {
    console.error('Bulk analyze error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;