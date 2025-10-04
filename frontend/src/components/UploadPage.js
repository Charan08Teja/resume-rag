import React, { useState } from 'react';
import { resumeAPI, userAPI } from '../services/api';

function UploadPage() {
  const [uploadType, setUploadType] = useState('single');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Single upload state
  const [singleFile, setSingleFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('1');

  // Bulk upload state
  const [bulkFile, setBulkFile] = useState(null);

  const handleSingleUpload = async (e) => {
    e.preventDefault();
    if (!singleFile || !title || !userId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', singleFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('userId', userId);

      const response = await resumeAPI.uploadResume(formData);
      setMessage(`Resume uploaded successfully! ID: ${response.resume.id}`);
      
      // Reset form
      setSingleFile(null);
      setTitle('');
      setDescription('');
      document.getElementById('single-file').value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile || !userId) {
      setError('Please select a ZIP file and enter User ID');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await resumeAPI.uploadBulkResumes(bulkFile, userId);
      setMessage(`Bulk upload successful! ${response.resumes.length} resumes uploaded.`);
      
      // Reset form
      setBulkFile(null);
      document.getElementById('bulk-file').value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'single') {
      setSingleFile(file);
      if (file && !title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } else {
      setBulkFile(file);
    }
  };

  return (
    <div className="upload-page">
      <div className="container">
        <h1>Upload Resumes</h1>
        <p>Upload single resume files or bulk upload multiple resumes from a ZIP file.</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="upload-tabs">
          <button
            className={`tab ${uploadType === 'single' ? 'active' : ''}`}
            onClick={() => setUploadType('single')}
          >
            Single Upload
          </button>
          <button
            className={`tab ${uploadType === 'bulk' ? 'active' : ''}`}
            onClick={() => setUploadType('bulk')}
          >
            Bulk Upload (ZIP)
          </button>
        </div>

        {uploadType === 'single' ? (
          <form onSubmit={handleSingleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="single-file">Resume File *</label>
              <input
                type="file"
                id="single-file"
                accept=".pdf,.docx"
                onChange={(e) => handleFileChange(e, 'single')}
                className="form-control"
                required
              />
              <small>Supported formats: PDF, DOCX</small>
            </div>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-control"
                placeholder="e.g., Software Engineer Resume"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                placeholder="Optional description of the resume"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="userId">User ID *</label>
              <input
                type="number"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="form-control"
                placeholder="User ID who uploaded this resume"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBulkUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="bulk-file">ZIP File *</label>
              <input
                type="file"
                id="bulk-file"
                accept=".zip"
                onChange={(e) => handleFileChange(e, 'bulk')}
                className="form-control"
                required
              />
              <small>ZIP file containing PDF and DOCX resume files</small>
            </div>

            <div className="form-group">
              <label htmlFor="bulkUserId">User ID *</label>
              <input
                type="number"
                id="bulkUserId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="form-control"
                placeholder="User ID for all resumes in this ZIP"
                required
              />
            </div>

            <div className="form-group">
              <div className="info-box">
                <h4>📋 Bulk Upload Instructions:</h4>
                <ul>
                  <li>Create a ZIP file containing multiple resume files</li>
                  <li>Supported file formats: PDF, DOCX</li>
                  <li>Each file will be automatically parsed and stored</li>
                  <li>File names will be used as resume titles</li>
                </ul>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload ZIP File'}
            </button>
          </form>
        )}

        <div className="upload-stats">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>Supported Formats</h3>
              <p>PDF and DOCX files are automatically parsed and indexed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-content">
              <h3>Automatic Processing</h3>
              <p>Resumes are parsed, content extracted, and made searchable</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <h3>Job Matching</h3>
              <p>Uploaded resumes can be matched with job requirements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
