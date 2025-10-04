# ResumeRAG API Documentation

## Overview
This backend provides APIs for resume management, search, and job matching functionality.

## Base URL
`http://localhost:5000/api`

## Endpoints

### Resume Management

#### POST /api/resumes
Upload a single resume file.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: Resume file (PDF/DOCX)
  - `title`: Resume title
  - `description`: Resume description (optional)
  - `userId`: User ID who uploaded the resume

**Response:**
```json
{
  "message": "Resume uploaded successfully",
  "resume": {
    "id": 1,
    "title": "Software Engineer Resume",
    "description": "John Doe's resume",
    "fileUrl": "uploads/1759595505533.pdf",
    "content": "Extracted text content...",
    "userId": 1
  }
}
```

#### POST /api/resumes/bulk
Upload multiple resumes from a ZIP file.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `zip`: ZIP file containing resume files
  - `userId`: User ID

**Response:**
```json
{
  "message": "Bulk resumes uploaded successfully",
  "resumes": [...]
}
```

#### GET /api/resumes
List resumes with pagination and search.

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `offset`: Starting position (default: 0)
- `q`: Search query
- `userId`: Filter by user ID

**Response:**
```json
{
  "resumes": [...],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /api/resumes/:id
Get individual resume by ID.

**Query Parameters:**
- `redactPII`: Set to 'true' to redact PII (default: false)

**Response:**
```json
{
  "resume": {
    "id": 1,
    "title": "Software Engineer Resume",
    "content": "Resume content...",
    "User": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Resume Search

#### POST /api/ask
Search resumes with semantic query.

**Request:**
```json
{
  "query": "Python developer with machine learning experience",
  "k": 5
}
```

**Response:**
```json
{
  "query": "Python developer with machine learning experience",
  "results": [
    {
      "resumeId": 1,
      "title": "Data Scientist Resume",
      "snippet": "...relevant snippet...",
      "relevanceScore": 85,
      "candidate": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "totalMatches": 3
}
```

### Job Management

#### POST /api/jobs
Create a new job posting.

**Request:**
```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "description": "Job description...",
  "requirements": "Required skills and experience...",
  "location": "San Francisco, CA",
  "salary": "$120k-150k",
  "employmentType": "full-time",
  "postedBy": 1
}
```

**Response:**
```json
{
  "message": "Job created successfully",
  "job": {
    "id": 1,
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    ...
  }
}
```

#### GET /api/jobs/:id
Get job by ID.

**Response:**
```json
{
  "job": {
    "id": 1,
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "PostedBy": {
      "name": "HR Manager",
      "email": "hr@techcorp.com"
    }
  }
}
```

#### GET /api/jobs
List jobs with pagination and search.

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `offset`: Starting position (default: 0)
- `q`: Search query
- `company`: Filter by company

#### POST /api/jobs/:id/match
Match job with candidates.

**Request:**
```json
{
  "top_n": 5
}
```

**Response:**
```json
{
  "job": {
    "id": 1,
    "title": "Senior Software Engineer",
    "company": "Tech Corp"
  },
  "matches": [
    {
      "resumeId": 1,
      "candidate": {
        "name": "John Doe",
        "email": "john@example.com",
        "resumeTitle": "Software Engineer Resume"
      },
      "matchScore": 85,
      "missingRequirements": ["AWS", "Docker"],
      "evidence": ["5+ years Python experience", "Machine learning projects"],
      "strengths": ["Python", "React", "SQL"]
    }
  ],
  "totalCandidates": 25
}
```

### User Management

#### POST /users
Create a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Features

### PII Redaction
- Resumes can be retrieved with PII redacted for non-recruiters
- Redacts emails, phone numbers, and addresses

### Deterministic Ranking
- Search results are ranked using consistent scoring algorithms
- Job matching uses skill-based scoring for reproducible results

### Bulk Upload Support
- ZIP file upload for processing multiple resumes at once
- Supports PDF and DOCX formats

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error
