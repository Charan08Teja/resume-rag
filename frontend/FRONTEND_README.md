# ResumeRAG Frontend

A modern React frontend for the ResumeRAG application, providing an intuitive interface for resume management, search, and job matching.

## Features

### 🏠 **Home Page**
- Welcome landing page with feature overview
- Quick access to main functionality
- Modern hero section with call-to-action buttons

### 📄 **Upload Page (`/upload`)**
- **Single Resume Upload**: Upload individual PDF/DOCX files
- **Bulk Upload**: Upload ZIP files containing multiple resumes
- Real-time upload progress and feedback
- Automatic file parsing and content extraction
- Support for PDF and DOCX formats

### 🔍 **Search Page (`/search`)**
- **Semantic Search**: Natural language queries for resume search
- **Example Queries**: Pre-defined search suggestions
- **Relevance Scoring**: Deterministic ranking with match percentages
- **Highlighted Results**: Query terms highlighted in snippets
- **Candidate Information**: Direct links to candidate profiles

### 💼 **Jobs Page (`/jobs`)**
- **Job Management**: Create and manage job postings
- **Job Matching**: Intelligent candidate matching with evidence
- **Match Analysis**: Shows strengths, missing requirements, and evidence
- **Modal Interfaces**: Clean job creation and matching workflows

### 👤 **Candidate Page (`/candidates/:id`)**
- **Detailed Profiles**: Complete resume information and content
- **PII Redaction**: Toggle for privacy protection
- **Skills Extraction**: Automatic skill and experience detection
- **Content Analysis**: Education, experience, and skill categorization
- **Action Buttons**: Contact, save, and download options

## Technology Stack

- **React 19** - Latest React with modern features
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **CSS3** - Modern styling with Flexbox and Grid
- **Responsive Design** - Mobile-first approach

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Project Structure

```
frontend/src/
├── components/          # React components
│   ├── UploadPage.js    # Resume upload interface
│   ├── SearchPage.js    # Resume search interface
│   ├── JobsPage.js      # Job management interface
│   └── CandidatePage.js # Individual candidate profiles
├── services/            # API service layer
│   └── api.js          # Axios configuration and API calls
├── App.js              # Main application component
├── App.css             # Global styles and components
└── index.js            # Application entry point
```

## API Integration

The frontend communicates with the backend through a comprehensive API service layer:

### Resume API
- `uploadResume()` - Single file upload
- `uploadBulkResumes()` - ZIP bulk upload
- `getResumes()` - List with pagination and search
- `getResume()` - Individual resume with PII redaction

### Search API
- `searchResumes()` - Semantic search with relevance scoring

### Job API
- `createJob()` - Create new job postings
- `getJob()` - Retrieve job details
- `getJobs()` - List jobs with pagination
- `matchJob()` - Intelligent candidate matching

## UI/UX Features

### 🎨 **Modern Design**
- Gradient backgrounds and smooth animations
- Card-based layouts with subtle shadows
- Consistent color scheme and typography
- Professional and clean interface

### 📱 **Responsive Layout**
- Mobile-first design approach
- Adaptive grid layouts
- Touch-friendly interface elements
- Optimized for all screen sizes

### ⚡ **Performance Optimizations**
- Lazy loading for better performance
- Optimized API calls with error handling
- Efficient state management
- Smooth transitions and animations

### 🔒 **User Experience**
- Loading states and progress indicators
- Error handling with user-friendly messages
- Form validation and feedback
- Intuitive navigation and workflows

## Key Features Implemented

### ✅ **Must-Have Pages**
- `/upload` - Resume upload with bulk ZIP support
- `/search` - Semantic resume search
- `/jobs` - Job management and matching
- `/candidates/:id` - Individual candidate profiles

### ✅ **Advanced Functionality**
- **PII Redaction** - Privacy protection for sensitive data
- **Deterministic Rankings** - Consistent search results
- **Evidence-Based Matching** - Shows why candidates match
- **Skill Extraction** - Automatic skill and experience detection
- **Real-Time Feedback** - Upload progress and error handling

### ✅ **Professional UI**
- Modern gradient designs
- Responsive mobile layout
- Interactive components
- Professional color scheme
- Smooth animations and transitions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style
- ES6+ JavaScript
- Functional components with hooks
- Modern CSS with Flexbox/Grid
- Consistent naming conventions

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your hosting service

3. Configure environment variables for production API URL

The frontend is production-ready and fully integrated with the ResumeRAG backend API!
