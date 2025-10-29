// src/components/MongoDBViewer.jsx
import React, { useState, useEffect } from 'react';
import { getAllResumes } from '../utils/api';

export default function MongoDBViewer() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const result = await getAllResumes();
      
      if (Array.isArray(result)) {
        setResumes(result);
        setError('');
      } else if (result.success === false) {
        setError(result.message || 'Failed to fetch resumes');
        setResumes([]);
      } else {
        setResumes([]);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Failed to connect to database');
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatEducation = (education) => {
    if (!education) return 'N/A';
    return (
      <div>
        <div><strong>10th:</strong> {education.tenth || 'N/A'}</div>
        <div><strong>12th:</strong> {education.twelfth || 'N/A'}</div>
        <div><strong>Graduation:</strong> {education.graduation || 'N/A'}</div>
        <div><strong>Post-Graduation:</strong> {education.postGraduation || 'N/A'}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading MongoDB data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Resume Database</h3>
            <button className="btn btn-primary" onClick={fetchResumes}>
              Refresh Data
            </button>
          </div>

          {error && (
            <div className="alert alert-danger">
              <strong>Error:</strong> {error}
              <br />
              <small>Make sure the backend server is running on port 4000</small>
            </div>
          )}

          {resumes.length === 0 && !error && (
            <div className="alert alert-info">
              <strong>No Data Found</strong>
              <p className="mb-0">No resumes found in MongoDB database. Complete the chat interface to save data.</p>
            </div>
          )}

          {resumes.length > 0 && (
            <>
              <div className="alert alert-success">
                <strong>✅ Connected to MongoDB!</strong> Found {resumes.length} resume(s) in database.
              </div>

              <div className="row">
                {/* Resume List */}
                <div className="col-md-4">
                  <h5>Saved Resumes ({resumes.length})</h5>
                  <div className="list-group">
                    {resumes.map((resume, index) => (
                      <button
                        key={resume._id}
                        className={`list-group-item list-group-item-action ${
                          selectedResume?._id === resume._id ? 'active' : ''
                        }`}
                        onClick={() => setSelectedResume(resume)}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">{resume.name}</h6>
                          <small>{formatDate(resume.createdAt)}</small>
                        </div>
                        <p className="mb-1">{resume.email}</p>
                        <small>
                          {resume.fresher_status === 'yes' ? 'Fresher' : 'Experienced'} • 
                          ID: {resume._id.slice(-6)}
                        </small>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resume Details */}
                <div className="col-md-8">
                  {selectedResume ? (
                    <div className="card">
                      <div className="card-header">
                        <h5>Resume Details</h5>
                        <small className="text-muted">
                          Created: {formatDate(selectedResume.createdAt)} | 
                          Updated: {formatDate(selectedResume.updatedAt)} |
                          ID: {selectedResume._id}
                        </small>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <h6>Personal Information</h6>
                            <p><strong>Name:</strong> {selectedResume.name}</p>
                            <p><strong>Email:</strong> {selectedResume.email}</p>
                            <p><strong>Phone:</strong> {selectedResume.phone}</p>
                            <p><strong>Status:</strong> {selectedResume.fresher_status === 'yes' ? 'Fresher' : 'Experienced'}</p>
                          </div>
                          <div className="col-md-6">
                            <h6>Education</h6>
                            {formatEducation(selectedResume.education)}
                          </div>
                        </div>

                        <hr />

                        <div className="row">
                          <div className="col-md-6">
                            <h6>Technical Skills</h6>
                            <p>{selectedResume.technical_skills || 'N/A'}</p>
                          </div>
                          <div className="col-md-6">
                            <h6>Soft Skills</h6>
                            <p>{selectedResume.soft_skills || 'N/A'}</p>
                          </div>
                        </div>

                        {selectedResume.experience && (
                          <>
                            <hr />
                            <h6>Work Experience</h6>
                            <p>{selectedResume.experience}</p>
                          </>
                        )}

                        {selectedResume.projects && (
                          <>
                            <hr />
                            <h6>Projects</h6>
                            <p>{selectedResume.projects}</p>
                          </>
                        )}

                        {selectedResume.skills && selectedResume.skills.length > 0 && (
                          <>
                            <hr />
                            <h6>All Skills (Legacy Format)</h6>
                            <div className="d-flex flex-wrap gap-1">
                              {selectedResume.skills.map((skill, index) => (
                                <span key={index} className="badge bg-secondary">{skill}</span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="card">
                      <div className="card-body text-center text-muted">
                        <h5>Select a resume to view details</h5>
                        <p>Click on a resume from the list to see its complete information stored in MongoDB.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
