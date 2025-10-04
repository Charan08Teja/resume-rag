const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Resume = require('../models/Resume');
const User = require('../models/User');

// POST /api/ask
router.post('/', async (req, res) => {
  try {
    const { query, k = 5 } = req.body; // k = top results
    if (!query) return res.status(400).json({ error: 'Query is required' });

    // Search resumes with content matching
    const resumes = await Resume.findAll({
      where: {
        content: {
          [Op.iLike]: `%${query}%`
        }
      },
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    // Calculate relevance scores and extract snippets
    const results = resumes
      .map(resume => {
        const content = resume.content.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Calculate relevance score based on multiple factors
        let score = 0;
        const queryWords = queryLower.split(/\s+/);
        
        // Exact phrase match (highest score)
        if (content.includes(queryLower)) {
          score += 100;
        }
        
        // Word frequency scoring
        queryWords.forEach(word => {
          if (word.length > 2) { // Ignore short words
            const wordCount = (content.match(new RegExp(word, 'g')) || []).length;
            score += wordCount * 10;
          }
        });
        
        // Title match bonus
        if (resume.title.toLowerCase().includes(queryLower)) {
          score += 50;
        }
        
        // Extract snippet around first match
        const matchIndex = content.indexOf(queryLower);
        let snippet = '';
        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 100);
          const end = Math.min(content.length, matchIndex + queryLower.length + 100);
          snippet = resume.content.substring(start, end);
        } else {
          // Fallback: take first 200 chars
          snippet = resume.content.substring(0, 200);
        }

        return {
          resumeId: resume.id,
          title: resume.title,
          snippet: snippet.trim(),
          score,
          user: resume.User
        };
      })
      .sort((a, b) => b.score - a.score) // Sort by relevance score (deterministic)
      .slice(0, k); // top k results

    res.json({ 
      query,
      results: results.map(r => ({
        resumeId: r.resumeId,
        title: r.title,
        snippet: r.snippet,
        relevanceScore: r.score,
        candidate: {
          name: r.user.name,
          email: r.user.email
        }
      })),
      totalMatches: results.length
    });
  } catch (err) {
    console.error('❌ Error in ask endpoint:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
