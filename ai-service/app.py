from flask import Flask, request, jsonify,render_template_string
from flask_cors import CORS
import os
import PyPDF2
from werkzeug.utils import secure_filename
import re
from sklearn.feature_extraction.text import CountVectorizer
import docx2txt
import tempfile
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create uploads directory
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to extract text from uploaded PDF
def extract_text_from_pdf(file_path):
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + ' '
            return text.lower()
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

# Function to extract text from Word documents
def extract_text_from_docx(file_path):
    try:
        text = docx2txt.process(file_path)
        return text.lower() if text else ''
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {str(e)}")
        raise Exception(f"Failed to extract text from Word document: {str(e)}")

# Function to extract text based on file type
def extract_text_from_file(file_path, filename):
    file_extension = filename.rsplit('.', 1)[1].lower()
    
    if file_extension == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension in ['doc', 'docx']:
        return extract_text_from_docx(file_path)
    else:
        raise Exception(f"Unsupported file type: {file_extension}")

# Enhanced skill extraction with predefined skill sets
def extract_skills_from_text(text):
    # Comprehensive skill database
    technical_skills = {
        'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
        'kotlin', 'typescript', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash',
        'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
        'spring', 'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind',
        'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'cassandra',
        'elasticsearch', 'dynamodb', 'firebase',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
        'gitlab', 'terraform', 'ansible', 'chef', 'puppet',
        'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy',
        'scikit-learn', 'keras', 'opencv', 'nlp', 'data analysis', 'statistics',
        'android', 'ios', 'react native', 'flutter', 'xamarin', 'cordova',
        'jest', 'mocha', 'selenium', 'cypress', 'junit', 'pytest',
        'graphql', 'rest api', 'microservices', 'blockchain', 'ethereum', 'solidity'
    }
    
    soft_skills = {
        'leadership', 'communication', 'teamwork', 'problem solving', 'analytical thinking',
        'project management', 'time management', 'adaptability', 'creativity', 'innovation',
        'critical thinking', 'collaboration', 'presentation', 'negotiation', 'mentoring'
    }
    
    all_skills = technical_skills.union(soft_skills)
    
    # Clean text and find skills
    text = re.sub(r'[^a-zA-Z0-9\s\.\+\#]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    found_skills = set()
    
    # Direct skill matching
    for skill in all_skills:
        if skill in text:
            found_skills.add(skill)
    
    # Handle special cases and variations
    skill_variations = {
        'node': 'node.js',
        'nodejs': 'node.js',
        'reactjs': 'react',
        'vuejs': 'vue',
        'angularjs': 'angular',
        'c plus plus': 'c++',
        'cplusplus': 'c++',
        'csharp': 'c#',
        'dotnet': 'asp.net',
        'ml': 'machine learning',
        'ai': 'artificial intelligence',
        'dl': 'deep learning'
    }
    
    for variation, standard in skill_variations.items():
        if variation in text and standard in all_skills:
            found_skills.add(standard)
    
    return list(found_skills)

# Function to calculate skill match percentage
def calculate_skill_match(resume_skills, required_skills):
    resume_skills_set = set([skill.lower().strip() for skill in resume_skills])
    required_skills_set = set([skill.lower().strip() for skill in required_skills])
    
    # Find matches
    matched_skills = resume_skills_set.intersection(required_skills_set)
    missing_skills = required_skills_set - resume_skills_set
    
    # Calculate match percentage
    if len(required_skills_set) == 0:
        match_percentage = 0
    else:
        match_percentage = (len(matched_skills) / len(required_skills_set)) * 100
    
    return {
        'match_percentage': round(match_percentage, 2),
        'matched_skills': list(matched_skills),
        'missing_skills': list(missing_skills),
        'total_resume_skills': list(resume_skills_set),
        'recommendation': 'Recommended' if match_percentage >= 60 else 'Not Recommended'
    }
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'AI service is running'})

@app.route('/extract-skills', methods=['POST'])
def extract_skills():
    try:
        # Check if file is provided
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        file = request.files['resume']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PDF, DOC, and DOCX files are allowed'}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, filename)
        file.save(file_path)
        
        try:
            # Extract text from file
            resume_text = extract_text_from_file(file_path, filename)
            
            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from the resume'}), 400
            
            # Extract skills
            extracted_skills = extract_skills_from_text(resume_text)
            
            result = {
                'extracted_skills': extracted_skills,
                'total_skills_found': len(extracted_skills),
                'resume_text_length': len(resume_text),
                'message': 'Skills extracted successfully'
            }
            
            return jsonify(result)
            
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
            os.rmdir(temp_dir)
            
    except Exception as e:
        logger.error(f"Error in extract_skills: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/match-skills', methods=['POST'])
def match_skills():
    try:
        # Check if resume file and required skills are provided
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        file = request.files['resume']

        required_skills_str ="data structures, algorithms, problem solving, object-oriented programming, system design, version control, git, github, databases, sql, mysql, postgresql, mongodb, software engineering, debugging, unit testing, integration testing, api development, rest api, graphql, http, web development, html, css, javascript, typescript, react, angular, vue, node.js, express.js, java, python, c++, c#, golang, ruby, docker, kubernetes, linux, bash, shell scripting, agile, scrum, test-driven development, design patterns, code optimization, scalability, performance tuning, microservices, cloud computing, aws, azure, gcp, continuous integration, continuous deployment, ci/cd, devops, authentication, authorization, json, xml, networking, sockets, message queues, redis, kafka"
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PDF, DOC, and DOCX files are allowed'}), 400
        
        # Parse required skills
        required_skills = [skill.strip() for skill in required_skills_str.split(',') if skill.strip()]
        print(required_skills)
        
        if not required_skills:
            return jsonify({'error': 'No valid required skills provided'}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, filename)
        file.save(file_path)
        
        try:
            # Extract text from file
            resume_text = extract_text_from_file(file_path, filename)
            
            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from the resume'}), 400
            
            # Extract skills from resume
            resume_skills = extract_skills_from_text(resume_text)
            
            # Calculate match
            match_result = calculate_skill_match(resume_skills, required_skills)
            
            # Add additional info
            match_result['candidate_name'] = request.form.get('candidate_name', 'Unknown')
            match_result['job_title'] = request.form.get('job_title', 'Unknown Position')
            print(match_result)
            return jsonify(match_result)
            
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
            os.rmdir(temp_dir)
            
    except Exception as e:
        logger.error(f"Error in match_skills: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/bulk-match-skills', methods=['POST'])
def bulk_match_skills():
    try:
        data = request.get_json()
        
        if not data or 'candidates' not in data or 'required_skills' not in data:
            return jsonify({'error': 'Invalid request data'}), 400
        
        candidates = data['candidates']
        required_skills = data['required_skills']
        job_title = data.get('job_title', 'Unknown Position')
        
        if not isinstance(candidates, list) or not candidates:
            return jsonify({'error': 'No candidates provided'}), 400
        
        results = []
        
        for candidate in candidates:
            try:
                # Extract skills from candidate's resume text (if available)
                resume_text = candidate.get('resume_text', '')
                candidate_skills = candidate.get('skills', [])
                
                # If resume text is available, extract skills from it
                if resume_text:
                    extracted_skills = extract_skills_from_text(resume_text)
                    # Combine with manually entered skills
                    all_skills = list(set(candidate_skills + extracted_skills))
                else:
                    all_skills = candidate_skills
                
                # Calculate match
                match_result = calculate_skill_match(all_skills, required_skills)
                
                # Add candidate info
                result = {
                    'candidate_id': candidate.get('id'),
                    'candidate_name': candidate.get('name', 'Unknown'),
                    'candidate_email': candidate.get('email', ''),
                    'job_title': job_title,
                    **match_result
                }
                
                results.append(result)
                
            except Exception as e:
                logger.error(f"Error processing candidate {candidate.get('name', 'Unknown')}: {str(e)}")
                results.append({
                    'candidate_id': candidate.get('id'),
                    'candidate_name': candidate.get('name', 'Unknown'),
                    'error': str(e)
                })
        
        # Sort by match percentage (highest first)
        results.sort(key=lambda x: x.get('match_percentage', 0), reverse=True)
        
        # Separate recommended and not recommended
        recommended = [r for r in results if r.get('recommendation') == 'Recommended']
        not_recommended = [r for r in results if r.get('recommendation') == 'Not Recommended']
        
        return jsonify({
            'job_title': job_title,
            'total_candidates': len(candidates),
            'recommended_count': len(recommended),
            'not_recommended_count': len(not_recommended),
            'recommended': recommended,
            'not_recommended': not_recommended,
            'all_results': results
        })
        
    except Exception as e:
        logger.error(f"Error in bulk_match_skills: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)