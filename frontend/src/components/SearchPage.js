import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchAPI, resumeAPI } from '../services/api';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalMatches, setTotalMatches] = useState(0);
  const [k, setK] = useState(5);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await searchAPI.searchResumes(query, k);
      setResults(response.results || []);
      setTotalMatches(response.totalMatches || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const exampleQueries = [
    "Python developer with machine learning experience",
    "React frontend developer",
    "Data scientist with SQL skills",
    "Full stack engineer",
    "DevOps engineer with AWS experience"
  ];

  return (
    <div className="search-page">
      <div className="container">
        <h1>Search Resumes</h1>
        <p>Search through uploaded resumes using natural language queries.</p>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Python developer with machine learning experience"
                className="search-input"
                disabled={loading}
              />
              <div className="search-controls">
                <select
                  value={k}
                  onChange={(e) => setK(parseInt(e.target.value))}
                  className="form-select"
                  disabled={loading}
                >
                  <option value={3}>Top 3</option>
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                </select>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !query.trim()}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          <div className="example-queries">
            <h4>Example queries:</h4>
            <div className="query-chips">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  className="query-chip"
                  onClick={() => setQuery(example)}
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {results.length > 0 && (
          <div className="search-results">
            <div className="results-header">
              <h2>Search Results</h2>
              <p>Found {totalMatches} matches for "{query}"</p>
            </div>

            <div className="results-list">
              {results.map((result, index) => (
                <div key={result.resumeId} className="result-card">
                  <div className="result-header">
                    <div className="result-info">
                      <h3>
                        <Link to={`/candidates/${result.resumeId}`}>
                          {result.title}
                        </Link>
                      </h3>
                      <div className="result-meta">
                        <span className="candidate-name">
                          👤 {result.candidate.name}
                        </span>
                        <span className="candidate-email">
                          📧 {result.candidate.email}
                        </span>
                        <span className="relevance-score">
                          🎯 {result.relevanceScore}% match
                        </span>
                      </div>
                    </div>
                    <div className="result-actions">
                      <Link
                        to={`/candidates/${result.resumeId}`}
                        className="btn btn-outline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                  
                  <div className="result-snippet">
                    <h4>Relevant Content:</h4>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: highlightText(result.snippet, query)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try adjusting your search query or check the spelling.</p>
            <div className="search-tips">
              <h4>Search Tips:</h4>
              <ul>
                <li>Use specific skills or technologies (e.g., "React", "Python")</li>
                <li>Include experience level (e.g., "senior", "junior")</li>
                <li>Mention job titles or roles (e.g., "data scientist", "frontend developer")</li>
                <li>Combine multiple criteria (e.g., "Python developer with machine learning")</li>
              </ul>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Searching resumes...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
