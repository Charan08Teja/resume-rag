require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User');
const Resume = require('./models/Resume');
const Job = require('./models/Job');

const resumeRoutes = require('./routes/resumes');           // Single resume upload
const resumeBulkRoutes = require('./routes/resumeBulk');    // Bulk ZIP upload
const askRoutes = require('./routes/ask');                 // Resume query
const jobRoutes = require('./routes/jobs');                // Job management

const app = express(); // Must declare before using app

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.static('uploads')); // Serve uploaded files

// Routes
app.use('/api/resumes', resumeRoutes);
app.use('/api/resumes/bulk', resumeBulkRoutes); // optional bulk upload
app.use('/api/ask', askRoutes);
app.use('/api/jobs', jobRoutes);

// Default root route
app.get('/', (req, res) => {
  res.send('🚀 ResumeRAG Server is running...');
});

// POST /users - create a new user
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const user = await User.create({ name, email });

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test database connection
sequelize.authenticate()
  .then(() => console.log('✅ Database connected successfully!'))
  .catch(err => console.error('❌ Unable to connect to the database:', err));

// Sync models with DB
sequelize.sync({ alter: true })
  .then(() => console.log('✅ All models synced with the database!'))
  .catch(err => console.error('❌ Error syncing models:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
