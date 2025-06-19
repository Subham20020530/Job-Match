import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    required: true
  },
  salary: {
    type: String,
    trim: true
  },
  jobType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']
  },
  experienceLevel: {
    type: String,
    required: true,
    enum: ['Entry Level', 'Mid Level', 'Senior', 'Director', 'Executive']
  },
  skills: {
    type: [String],
    required: true
  },
  sector: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  applicationDeadline: {
    type: Date
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Create index for search
jobSchema.index({ 
  title: 'text', 
  company: 'text', 
  location: 'text', 
  description: 'text',
  skills: 'text',
  sector: 'text'
});

const Job = mongoose.model('Job', jobSchema);
export default Job;