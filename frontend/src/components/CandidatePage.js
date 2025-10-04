import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resumeAPI } from '../services/api';

function CandidatePage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullContent, setShowFullContent] = useState(false);
  const [redactPII, setRedactPII] = useState(false);

  useEffect(() => {
    fetchResume();
  }, [id, redactPII]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResume(id, redactPII);
      setResume(response.resume);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch resume');
    } finally {
      setLoading(false);
    }
  };

  const extractSkills = (content) => {
    if (!content) return [];
    
    const skillPatterns = [
      /\b(?:JavaScript|JS|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|TypeScript)\b/gi,
      /\b(?:React|Angular|Vue|Node\.?js|Express|Django|Flask|Spring|Laravel|Rails)\b/gi,
      /\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|MongoDB|PostgreSQL|MySQL|Redis)\b/gi,
      /\b(?:Machine Learning|AI|Data Science|Analytics|Statistics|SQL|NoSQL)\b/gi,
    ];

    const skills = [];
    skillPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        skills.push(...matches);
      }
    });

    return [...new Set(skills)]; // Remove duplicates
  };

  const extractExperience = (content) => {
    if (!content) return [];
    
    const experiencePattern = /\b\d+\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi;
    const matches = content.match(experiencePattern);
    return matches || [];
  };

  const extractEducation = (content) => {
    if (!content) return [];
    
    const educationPattern = /\b(?:Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.|Computer Science|Engineering|Mathematics|Physics|Chemistry)\b/gi;
    const matches = content.match(educationPattern);
    return [...new Set(matches)] || [];
  };

  const formatContent = (content) => {
    if (!content) return '';
    
    // Split into paragraphs and format
    const paragraphs = content.split('\n').filter(p => p.trim());
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="content-paragraph">
        {paragraph.trim()}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="candidate-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading candidate information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidate-page">
        <div className="container">
          <div className="error-state">
            <h2>Error</h2>
            <p>{error}</p>
            <Link to="/search" className="btn btn-primary">Back to Search</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="candidate-page">
        <div className="container">
          <div className="not-found">
            <h2>Candidate Not Found</h2>
            <p>The requested candidate profile could not be found.</p>
            <Link to="/search" className="btn btn-primary">Back to Search</Link>
          </div>
        </div>
      </div>
    );
  }

  const skills = extractSkills(resume.content);
  const experience = extractExperience(resume.content);
  const education = extractEducation(resume.content);

  return (
    <div className="candidate-page">
      <div className="container">
        <div className="candidate-header">
          <div className="candidate-info">
            <h1>{resume.title}</h1>
            <div className="candidate-meta">
              <span className="candidate-name">
                👤 {resume.User?.name || 'Unknown'}
              </span>
              <span className="candidate-email">
                📧 {resume.User?.email || 'No email'}
              </span>
            </div>
          </div>
          
          <div className="candidate-actions">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={redactPII}
                onChange={(e) => setRedactPII(e.target.checked)}
              />
              <span>Redact PII</span>
            </label>
            <Link to="/search" className="btn btn-secondary">Back to Search</Link>
          </div>
        </div>

        <div className="candidate-content">
          <div className="candidate-sidebar">
            <div className="info-card">
              <h3>📋 Skills</h3>
              <div className="skills-list">
                {skills.length > 0 ? (
                  <div className="skill-tags">
                    {skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No skills detected</p>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>💼 Experience</h3>
              <div className="experience-list">
                {experience.length > 0 ? (
                  <ul>
                    {experience.map((exp, index) => (
                      <li key={index}>{exp}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data">No experience mentioned</p>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>🎓 Education</h3>
              <div className="education-list">
                {education.length > 0 ? (
                  <div className="skill-tags">
                    {education.map((edu, index) => (
                      <span key={index} className="skill-tag education">{edu}</span>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No education mentioned</p>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>📄 File Information</h3>
              <div className="file-info">
                <p><strong>File:</strong> {resume.fileUrl}</p>
                <p><strong>Uploaded:</strong> {new Date(resume.createdAt).toLocaleDateString()}</p>
                <p><strong>Content Length:</strong> {resume.content?.length || 0} characters</p>
              </div>
            </div>
          </div>

          <div className="candidate-main">
            <div className="content-card">
              <div className="content-header">
                <h2>Resume Content</h2>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowFullContent(!showFullContent)}
                >
                  {showFullContent ? 'Show Summary' : 'Show Full Content'}
                </button>
              </div>
              
              <div className="content-body">
                {showFullContent ? (
                  <div className="full-content">
                    {formatContent(resume.content)}
                  </div>
                ) : (
                  <div className="summary-content">
                    <p className="content-summary">
                      {resume.content?.substring(0, 500)}
                      {resume.content?.length > 500 && '...'}
                    </p>
                    {resume.content?.length > 500 && (
                      <button
                        className="btn btn-link"
                        onClick={() => setShowFullContent(true)}
                      >
                        Read more
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="actions-card">
              <h3>Actions</h3>
              <div className="action-buttons">
                <button className="btn btn-primary">Contact Candidate</button>
                <button className="btn btn-secondary">Save to Favorites</button>
                <button className="btn btn-outline">Download Resume</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidatePage;
