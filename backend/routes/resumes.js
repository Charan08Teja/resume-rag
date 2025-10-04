// backend/routes/resumes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Resume = require('../models/Resume');
const User = require('../models/User');
const upload = require('../middleware/upload'); // multer setup
const parseResume = require('../utils/parseResume'); // helper to extract text

// POST /api/resumes - single file upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, description, userId } = req.body;

    if (!req.file || !title || !userId) {
      return res.status(400).json({ error: 'Title, file, and userId are required' });
    }

    const filePath = req.file.path;

    // Parse file content (PDF or DOCX)
    let content = '';
    try {
      content = await parseResume(filePath);
    } catch (err) {
      console.error('❌ Error parsing resume:', err);
    }

    const resume = await Resume.create({
      title,
      description,
      fileUrl: filePath,
      userId,
      content
    });

    res.status(201).json({ message: 'Resume uploaded successfully', resume });
  } catch (err) {
    console.error('❌ Error uploading resume:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/resumes - list resumes with pagination and search
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0, q = '', userId } = req.query;
    
    const whereClause = {};
    if (userId) whereClause.userId = userId;
    if (q) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { content: { [Op.iLike]: `%${q}%` } }
      ];
    }

    const { count, rows: resumes } = await Resume.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    res.json({ 
      resumes, 
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < count
      }
    });
  } catch (err) {
    console.error('❌ Error fetching resumes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/resumes/:id - get individual resume
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { redactPII = false } = req.query;
    
    const resume = await Resume.findByPk(id, {
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    let content = resume.content;
    
    // Redact PII if requested and user is not a recruiter
    if (redactPII === 'true') {
      content = redactPIIFromText(content);
    }

    res.json({ 
      resume: {
        ...resume.toJSON(),
        content
      }
    });
  } catch (err) {
    console.error('❌ Error fetching resume:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to redact PII
function redactPIIFromText(text) {
  if (!text) return text;
  
  // Email pattern
  text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
  
  // Phone pattern (various formats)
  text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
  text = text.replace(/\(\d{3}\)\s*\d{3}[-.]?\d{4}/g, '[PHONE]');
  
  // Address pattern (basic)
  text = text.replace(/\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Place|Pl)/gi, '[ADDRESS]');
  
  return text;
}

module.exports = router;
