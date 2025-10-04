const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const User = require('../models/User');

// POST /api/jobs - create a new job posting
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      company, 
      description, 
      requirements, 
      location, 
      salary, 
      employmentType = 'full-time',
      postedBy 
    } = req.body;

    if (!title || !company || !description || !requirements || !postedBy) {
      return res.status(400).json({ 
        error: 'Title, company, description, requirements, and postedBy are required' 
      });
    }

    const job = await Job.create({
      title,
      company,
      description,
      requirements,
      location,
      salary,
      employmentType,
      postedBy
    });

    res.status(201).json({ 
      message: 'Job created successfully', 
      job 
    });
  } catch (err) {
    console.error('❌ Error creating job:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/jobs/:id - get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findByPk(id, {
      include: [{ model: User, as: 'PostedBy', attributes: ['name', 'email'] }]
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job });
  } catch (err) {
    console.error('❌ Error fetching job:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/jobs - list all jobs with pagination
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0, q = '', company = '' } = req.query;
    
    const whereClause = {};
    if (q) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { requirements: { [Op.iLike]: `%${q}%` } }
      ];
    }
    if (company) {
      whereClause.company = { [Op.iLike]: `%${company}%` };
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'PostedBy', attributes: ['name', 'email'] }]
    });

    res.json({ 
      jobs, 
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < count
      }
    });
  } catch (err) {
    console.error('❌ Error fetching jobs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/jobs/:id/match - match job with candidates
router.post('/:id/match', async (req, res) => {
  try {
    const { id } = req.params;
    const { top_n = 5 } = req.body;

    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get all resumes
    const resumes = await Resume.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    // Extract job requirements and skills
    const jobRequirements = extractSkillsAndRequirements(job.requirements);
    const jobDescription = extractSkillsAndRequirements(job.description);

    // Match candidates
    const matches = resumes.map(resume => {
      const resumeSkills = extractSkillsAndRequirements(resume.content);
      const matchScore = calculateMatchScore(jobRequirements, jobDescription, resumeSkills);
      
      // Find missing requirements
      const missingRequirements = findMissingRequirements(jobRequirements, resumeSkills);
      
      // Extract evidence snippets
      const evidence = extractEvidence(resume.content, jobRequirements);

      return {
        resumeId: resume.id,
        candidate: {
          name: resume.User.name,
          email: resume.User.email,
          resumeTitle: resume.title
        },
        matchScore,
        missingRequirements,
        evidence,
        strengths: findStrengths(resumeSkills, jobRequirements)
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore) // Deterministic ranking
    .slice(0, top_n);

    res.json({
      job: {
        id: job.id,
        title: job.title,
        company: job.company
      },
      matches,
      totalCandidates: resumes.length
    });
  } catch (err) {
    console.error('❌ Error matching job:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions for job matching
function extractSkillsAndRequirements(text) {
  if (!text) return [];
  
  // Common technical skills and keywords
  const skills = [];
  const skillPatterns = [
    /\b(?:JavaScript|JS|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|TypeScript)\b/gi,
    /\b(?:React|Angular|Vue|Node\.?js|Express|Django|Flask|Spring|Laravel|Rails)\b/gi,
    /\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|MongoDB|PostgreSQL|MySQL|Redis)\b/gi,
    /\b(?:Machine Learning|AI|Data Science|Analytics|Statistics|SQL|NoSQL)\b/gi,
    /\b(?:years?|experience|skills?|proficient|expert|knowledge|familiar)\b/gi
  ];

  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      skills.push(...matches.map(m => m.toLowerCase()));
    }
  });

  return [...new Set(skills)]; // Remove duplicates
}

function calculateMatchScore(jobRequirements, jobDescription, resumeSkills) {
  let score = 0;
  const allJobKeywords = [...jobRequirements, ...jobDescription];
  
  // Count matching skills
  const matchingSkills = resumeSkills.filter(skill => 
    allJobKeywords.some(keyword => 
      keyword.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  score = (matchingSkills.length / Math.max(allJobKeywords.length, 1)) * 100;
  
  return Math.round(score);
}

function findMissingRequirements(jobRequirements, resumeSkills) {
  return jobRequirements.filter(req => 
    !resumeSkills.some(skill => 
      skill.toLowerCase().includes(req.toLowerCase()) || 
      req.toLowerCase().includes(skill.toLowerCase())
    )
  );
}

function extractEvidence(content, requirements) {
  const evidence = [];
  const sentences = content.split(/[.!?]+/);
  
  requirements.forEach(req => {
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes(req.toLowerCase())) {
        evidence.push(sentence.trim());
      }
    });
  });
  
  return evidence.slice(0, 3); // Limit to 3 evidence snippets
}

function findStrengths(resumeSkills, jobRequirements) {
  return resumeSkills.filter(skill => 
    jobRequirements.some(req => 
      skill.toLowerCase().includes(req.toLowerCase()) || 
      req.toLowerCase().includes(skill.toLowerCase())
    )
  );
}

module.exports = router;
