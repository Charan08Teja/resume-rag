import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume API
export const resumeAPI = {
  // Upload single resume
  uploadResume: async (formData) => {
    const response = await api.post('/resumes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload bulk resumes from ZIP
  uploadBulkResumes: async (zipFile, userId) => {
    const formData = new FormData();
    formData.append('zip', zipFile);
    formData.append('userId', userId);

    const response = await api.post('/resumes/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get resumes with pagination and search
  getResumes: async (params = {}) => {
    const response = await api.get('/resumes', { params });
    return response.data;
  },

  // Get individual resume
  getResume: async (id, redactPII = false) => {
    const response = await api.get(`/resumes/${id}`, {
      params: { redactPII }
    });
    return response.data;
  },
};

// Search API
export const searchAPI = {
  // Search resumes
  searchResumes: async (query, k = 5) => {
    const response = await api.post('/ask', { query, k });
    return response.data;
  },
};

// Job API
export const jobAPI = {
  // Create job
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Get job by ID
  getJob: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Get jobs with pagination and search
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  // Match job with candidates
  matchJob: async (jobId, top_n = 5) => {
    const response = await api.post(`/jobs/${jobId}/match`, { top_n });
    return response.data;
  },
};

// User API
export const userAPI = {
  // Create user
  createUser: async (userData) => {
    const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/users`, userData);
    return response.data;
  },
};

export default api;
