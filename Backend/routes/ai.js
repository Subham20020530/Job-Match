import express from 'express';
import { auth, recruiterOnly } from '../middleware/auth.js';

const router = express.Router();

// Mock AI evaluation function
const evaluateCandidates = (jobData) => {
  const { jobTitle, skills, experienceLevel, candidates } = jobData;
  
  const shortlisted = [];
  const notShortlisted = [];
  
  candidates.forEach(candidate => {
    let score = 0;
    const strengths = [];
    const weaknesses = [];
    
    // Skills matching (40% weight)
    const candidateSkills = candidate.skills || [];
    const requiredSkills = skills || [];
    const skillMatches = candidateSkills.filter(skill => 
      requiredSkills.some(reqSkill => 
        skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    const skillScore = (skillMatches.length / Math.max(requiredSkills.length, 1)) * 40;
    score += skillScore;
    
    if (skillMatches.length > 0) {
      strengths.push(`${skillMatches.length} matching skills`);
    } else {
      weaknesses.push('Limited skill matches');
    }
    
    // Experience evaluation (35% weight)
    const candidateExperience = candidate.experience || [];
    let experienceScore = 0;
    
    if (candidateExperience.length > 0) {
      // Calculate years of experience
      const totalYears = candidateExperience.reduce((total, exp) => {
        const start = new Date(exp.startDate);
        const end = exp.current ? new Date() : new Date(exp.endDate);
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
        return total + Math.max(0, years);
      }, 0);
      
      // Score based on experience level requirement
      switch (experienceLevel) {
        case 'Entry Level':
          experienceScore = Math.min(totalYears * 10, 35);
          break;
        case 'Mid Level':
          experienceScore = totalYears >= 2 ? Math.min((totalYears - 2) * 8 + 20, 35) : totalYears * 10;
          break;
        case 'Senior':
          experienceScore = totalYears >= 5 ? Math.min((totalYears - 5) * 5 + 30, 35) : totalYears * 6;
          break;
        default:
          experienceScore = Math.min(totalYears * 7, 35);
      }
      
      if (totalYears >= 2) {
        strengths.push(`${Math.round(totalYears)} years experience`);
      } else {
        weaknesses.push('Limited work experience');
      }
    } else {
      weaknesses.push('No work experience listed');
    }
    
    score += experienceScore;
    
    // Education evaluation (15% weight)
    const candidateEducation = candidate.education || [];
    let educationScore = 0;
    
    if (candidateEducation.length > 0) {
      educationScore = 15;
      strengths.push('Relevant education background');
    } else {
      weaknesses.push('No education information');
    }
    
    score += educationScore;
    
    // Resume availability (10% weight)
    if (candidate.resume) {
      score += 10;
      strengths.push('Resume available');
    } else {
      weaknesses.push('No resume uploaded');
    }
    
    // Round score
    score = Math.round(score);
    
    // Generate reasoning
    let reasoning;
    if (score >= 70) {
      reasoning = `Strong candidate with ${strengths.join(', ')}. Recommended for interview.`;
    } else if (score >= 50) {
      reasoning = `Decent candidate with ${strengths.join(', ')}, but ${weaknesses.join(', ')}. Consider for interview.`;
    } else {
      reasoning = `Limited match due to ${weaknesses.join(', ')}. May not be suitable for this role.`;
    }
    
    const evaluation = {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      score,
      reasoning,
      strengths,
      weaknesses
    };
    
    if (score >= 60) {
      shortlisted.push(evaluation);
    } else {
      notShortlisted.push(evaluation);
    }
  });
  
  // Sort by score
  shortlisted.sort((a, b) => b.score - a.score);
  notShortlisted.sort((a, b) => b.score - a.score);
  
  return {
    jobTitle,
    totalCandidates: candidates.length,
    shortlisted,
    notShortlisted,
    evaluationCriteria: {
      skills: '40%',
      experience: '35%',
      education: '15%',
      resume: '10%'
    }
  };
};

// Evaluate candidates for a job
router.post('/evaluate-candidates', auth, recruiterOnly, async (req, res) => {
  try {
    const evaluationData = req.body;
    
    // Validate input
    if (!evaluationData.jobTitle || !evaluationData.candidates || !Array.isArray(evaluationData.candidates)) {
      return res.status(400).json({ message: 'Invalid evaluation data' });
    }
    
    if (evaluationData.candidates.length === 0) {
      return res.status(400).json({ message: 'No candidates to evaluate' });
    }
    
    // Perform AI evaluation
    const results = evaluateCandidates(evaluationData);
    
    res.json(results);
  } catch (err) {
    console.error('AI evaluation error:', err);
    res.status(500).json({ message: 'Failed to evaluate candidates' });
  }
});

export default router;