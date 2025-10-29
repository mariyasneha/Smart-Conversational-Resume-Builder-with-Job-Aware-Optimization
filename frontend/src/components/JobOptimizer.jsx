import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export default function JobOptimizer({ resumeData, onOptimizationComplete }) {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // First, analyze the job description
      const analyzeResponse = await axios.post(`${API_BASE_URL}/job/analyze`, {
        jobDescription: jobDescription.trim()
      });

      if (!analyzeResponse.data.success) {
        throw new Error(analyzeResponse.data.message);
      }

      // Then, optimize resume based on job description
      const optimizeResponse = await axios.post(`${API_BASE_URL}/job/optimize`, {
        resumeData,
        jobDescription: jobDescription.trim()
      });

      if (!optimizeResponse.data.success) {
        throw new Error(optimizeResponse.data.message);
      }

      setResults({
        keywords: analyzeResponse.data.data.keywords,
        optimization: optimizeResponse.data.data
      });

      if (onOptimizationComplete) {
        onOptimizationComplete(optimizeResponse.data.data);
      }

    } catch (err) {
      console.error('Optimization error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to analyze job description');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const getScoreIcon = (score) => {
    // Return empty string to remove emojis
    return '';
  };

  return (
    <div className="job-optimizer">
      {/* Input Section */}
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Job-Aware Optimization</h5>
        </div>
        <div className="card-body">
          {/* Input Area */}
          <div>
            <label className="form-label fw-semibold">
              Paste Job Description:
            </label>
            <textarea
              className="form-control"
              rows="8"
              placeholder="Paste the complete job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {error && (
            <div className="alert alert-danger mt-3 mb-0">
              {error}
            </div>
          )}

          <button
            className="btn btn-primary w-100 mt-3"
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Analyzing...
              </>
            ) : (
              '🔍 Analyze & Optimize'
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <>
          {/* Match Score */}
          <div className="card shadow-sm mb-3">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">ATS Match Score</h6>
              <div className={`display-4 fw-bold text-${getScoreColor(results.optimization.matchScore)}`}>
                {getScoreIcon(results.optimization.matchScore)} {results.optimization.matchScore}%
              </div>
              <div className="progress mt-3" style={{ height: '10px' }}>
                <div
                  className={`progress-bar bg-${getScoreColor(results.optimization.matchScore)}`}
                  style={{ width: `${results.optimization.matchScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Matched Keywords */}
          {results.optimization.matchedKeywords.length > 0 && (
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">✅ Matched Keywords ({results.optimization.matchedKeywords.length})</h6>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {results.optimization.matchedKeywords.map((keyword, index) => (
                    <span key={index} className="badge bg-success">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {results.optimization.missingKeywords.length > 0 && (
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">Missing Keywords ({results.optimization.missingKeywords.length})</h6>
              </div>
              <div className="card-body">
                <p className="small text-muted mb-2">
                  Consider incorporating these keywords to improve your ATS score:
                </p>
                <div className="d-flex flex-wrap gap-2">
                  {results.optimization.missingKeywords.map((keyword, index) => (
                    <span key={index} className="badge bg-warning text-dark">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {results.optimization.aiSuggestions && (
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">🤖 AI-Powered Suggestions</h6>
              </div>
              <div className="card-body">
                {results.optimization.aiSuggestions.experienceSuggestion && (
                  <div className="mb-3">
                    <strong>Enhanced Experience:</strong>
                    <p className="mt-2 p-2 bg-light rounded">
                      {results.optimization.aiSuggestions.experienceSuggestion}
                    </p>
                  </div>
                )}
                
                {results.optimization.aiSuggestions.suggestedSkills?.length > 0 && (
                  <div className="mb-3">
                    <strong>Suggested Skills to Add:</strong>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {results.optimization.aiSuggestions.suggestedSkills.map((skill, index) => (
                        <span key={index} className="badge bg-info">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {results.optimization.aiSuggestions.atsScore && (
                  <div>
                    <strong>AI ATS Score:</strong>
                    <span className="ms-2 badge bg-primary">
                      {results.optimization.aiSuggestions.atsScore}/100
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {results.optimization.recommendations?.length > 0 && (
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">💡 Recommendations</h6>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  {results.optimization.recommendations.map((rec, index) => (
                    <li key={index} className="mb-2">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Categorized Skills Analysis */}
          {results.optimization.categorizedAnalysis && (
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">Skills Analysis by Category</h6>
              </div>
              <div className="card-body">
                {Object.entries(results.optimization.categorizedAnalysis.matchesByCategory).map(([category, matches]) => (
                  <div key={category} className="mb-3">
                    <h6 className="fw-bold text-primary">{category}</h6>
                    <div className="row">
                      {matches.length > 0 && (
                        <div className="col-md-6">
                          <small className="text-success fw-semibold">You Have:</small>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {matches.map((skill, idx) => (
                              <span key={idx} className="badge bg-success">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {results.optimization.categorizedAnalysis.missingByCategory[category]?.length > 0 && (
                        <div className="col-md-6">
                          <small className="text-warning fw-semibold">Consider Adding:</small>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {results.optimization.categorizedAnalysis.missingByCategory[category].map((skill, idx) => (
                              <span key={idx} className="badge bg-warning text-dark">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* User's Current Skills by Category */}
                {results.optimization.categorizedAnalysis.userSkillsByCategory && 
                 Object.keys(results.optimization.categorizedAnalysis.userSkillsByCategory).length > 0 && (
                  <div className="mt-4">
                    <h6 className="fw-bold text-secondary">📋 Your Current Skills by Category:</h6>
                    {Object.entries(results.optimization.categorizedAnalysis.userSkillsByCategory).map(([category, skills]) => (
                      <div key={category} className="mb-2">
                        <small className="fw-semibold">{category}:</small>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {skills.map((skill, idx) => (
                            <span key={idx} className="badge bg-light text-dark border">{skill}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Extracted Keywords */}
          <div className="card shadow-sm">
            <div className="card-header">
              <h6 className="mb-0">📊 All Job Keywords ({results.keywords.length})</h6>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {results.keywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className={`badge ${
                      results.optimization.matchedKeywords.includes(keyword)
                        ? 'bg-success'
                        : 'bg-secondary'
                    }`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
