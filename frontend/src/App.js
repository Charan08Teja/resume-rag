import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// Components
import UploadPage from './components/UploadPage';
import SearchPage from './components/SearchPage';
import JobsPage from './components/JobsPage';
import CandidatePage from './components/CandidatePage';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/upload', label: 'Upload', icon: '📄' },
    { path: '/search', label: 'Search', icon: '🔍' },
    { path: '/jobs', label: 'Jobs', icon: '💼' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="nav-icon">🚀</span>
          ResumeRAG
        </Link>
        <div className="nav-menu">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to ResumeRAG</h1>
        <p>Intelligent Resume Search & Job Matching Platform</p>
        <div className="hero-features">
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Upload Resumes</h3>
            <p>Upload single files or bulk ZIP uploads with automatic parsing</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Smart Search</h3>
            <p>Search resumes with semantic queries and get relevant results</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Job Matching</h3>
            <p>Match job requirements with candidate profiles automatically</p>
          </div>
        </div>
        <div className="hero-actions">
          <Link to="/upload" className="btn btn-primary">Start Uploading</Link>
          <Link to="/search" className="btn btn-secondary">Search Resumes</Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/candidates/:id" element={<CandidatePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
