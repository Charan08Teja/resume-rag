import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../services/api';

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matching, setMatching] = useState(false);

  // Create job form state
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    employmentType: 'full-time',
    postedBy: '1'
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getJobs();
      setJobs(response.jobs || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await jobAPI.createJob(jobForm);
      setShowCreateForm(false);
      setJobForm({
        title: '',
        company: '',
        description: '',
        requirements: '',
        location: '',
        salary: '',
        employmentType: 'full-time',
        postedBy: '1'
      });
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create job');
    }
  };

  const handleMatchJob = async (jobId) => {
    try {
      setMatching(true);
      const response = await jobAPI.matchJob(jobId, 5);
      setSelectedJob(response.job);
      setMatches(response.matches);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to match job');
    } finally {
      setMatching(false);
    }
  };

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship'
    };
    return labels[type] || type;
  };

  return (
    <div className="jobs-page">
      <div className="container">
        <div className="page-header">
          <h1>Job Management</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            + Create New Job
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Create New Job</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateJob} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">Job Title *</label>
                    <input
                      type="text"
                      id="title"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company">Company *</label>
                    <input
                      type="text"
                      id="company"
                      value={jobForm.company}
                      onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                      className="form-control"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="salary">Salary</label>
                    <input
                      type="text"
                      id="salary"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                      className="form-control"
                      placeholder="e.g., $80k-120k"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="employmentType">Employment Type</label>
                    <select
                      id="employmentType"
                      value={jobForm.employmentType}
                      onChange={(e) => setJobForm({...jobForm, employmentType: e.target.value})}
                      className="form-control"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Job Description *</label>
                  <textarea
                    id="description"
                    value={jobForm.description}
                    onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                    className="form-control"
                    rows="4"
                    placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="requirements">Requirements *</label>
                  <textarea
                    id="requirements"
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                    className="form-control"
                    rows="4"
                    placeholder="List required skills, experience, education, and qualifications..."
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading jobs...</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="job-company">{job.company}</span>
                </div>
                
                <div className="job-meta">
                  <span className="job-location">📍 {job.location || 'Remote'}</span>
                  <span className="job-salary">💰 {job.salary || 'Competitive'}</span>
                  <span className="job-type">{getEmploymentTypeLabel(job.employmentType)}</span>
                </div>

                <div className="job-description">
                  <p>{job.description.substring(0, 150)}...</p>
                </div>

                <div className="job-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleMatchJob(job.id)}
                    disabled={matching}
                  >
                    {matching ? 'Matching...' : 'Find Candidates'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedJob && matches.length > 0 && (
          <div className="matches-modal">
            <div className="modal-overlay">
              <div className="modal large">
                <div className="modal-header">
                  <h2>Top Candidates for {selectedJob.title}</h2>
                  <button
                    className="btn-close"
                    onClick={() => {
                      setSelectedJob(null);
                      setMatches([]);
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div className="matches-list">
                  {matches.map((match, index) => (
                    <div key={match.resumeId} className="match-card">
                      <div className="match-rank">#{index + 1}</div>
                      <div className="match-info">
                        <h4>
                          <Link to={`/candidates/${match.resumeId}`}>
                            {match.candidate.name}
                          </Link>
                        </h4>
                        <p className="match-title">{match.candidate.resumeTitle}</p>
                        <div className="match-score">
                          <span className="score-badge">{match.matchScore}% Match</span>
                        </div>
                      </div>
                      
                      <div className="match-details">
                        <div className="match-strengths">
                          <h5>✅ Strengths:</h5>
                          <div className="skill-tags">
                            {match.strengths.map((strength, i) => (
                              <span key={i} className="skill-tag">{strength}</span>
                            ))}
                          </div>
                        </div>
                        
                        {match.missingRequirements.length > 0 && (
                          <div className="match-missing">
                            <h5>❌ Missing:</h5>
                            <div className="skill-tags">
                              {match.missingRequirements.map((missing, i) => (
                                <span key={i} className="skill-tag missing">{missing}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="match-evidence">
                          <h5>📋 Evidence:</h5>
                          <ul>
                            {match.evidence.map((evidence, i) => (
                              <li key={i}>{evidence}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobsPage;
