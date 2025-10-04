// backend/routes/resumeBulk.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');
const parseResume = require('../utils/parseResume');

// Multer setup for ZIP file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// POST /api/resumes/bulk - upload ZIP of resumes
router.post('/', upload.single('zip'), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file || !userId) {
      return res.status(400).json({ error: 'ZIP file and userId are required' });
    }

    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();
    const savedResumes = [];

    for (const entry of zipEntries) {
      if (!entry.isDirectory && /\.(pdf|docx)$/i.test(entry.entryName)) {
        const fileName = Date.now() + '-' + path.basename(entry.entryName);
        const filePath = path.join('uploads', fileName);

        // Extract file from ZIP
        fs.writeFileSync(filePath, entry.getData());

        // Parse resume text
        let content = '';
        try {
          content = await parseResume(filePath);
        } catch (err) {
          console.error('❌ Error parsing resume:', err);
        }

        // Save in DB
        const resume = await Resume.create({
          title: path.basename(entry.entryName, path.extname(entry.entryName)),
          description: 'Bulk upload',
          fileUrl: filePath,
          userId,
          content
        });

        savedResumes.push(resume);
      }
    }

    res.status(201).json({ message: 'Bulk resumes uploaded successfully', resumes: savedResumes });
  } catch (err) {
    console.error('❌ Error uploading bulk resumes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
