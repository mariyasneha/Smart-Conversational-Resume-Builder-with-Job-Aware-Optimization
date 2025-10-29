// Simple storage viewer - replacement for MongoDB viewer
import React, { useState, useEffect } from 'react';
import { getResumesList, getResumeById, deleteResume, clearAllResumes, getStorageInfo } from '../utils/simpleStorage';
import { exportResumeAsPDF, exportResumeAsPDFWithTemplate, exportMultipleResumesAsPDF } from '../utils/pdfStorage';

export default function SimpleStorageViewer() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [pdfTemplate, setPdfTemplate] = useState('professional');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = () => {
    const resumesList = getResumesList();
    setResumes(resumesList);
    setStorageInfo(getStorageInfo());
  };

  const handleSelectResume = (resumeId) => {
    const resume = getResumeById(resumeId);
    setSelectedResume(resume);
  };

  const handleDeleteResume = (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      const result = deleteResume(resumeId);
      if (result.success) {
        loadResumes();
        if (selectedResume?.id === resumeId) {
          setSelectedResume(null);
        }
        alert(result.message);
      } else {
        alert(result.message);
      }
    }
  };

  const handleClearAllResumes = () => {
    const resumeCount = resumes.length;
    if (resumeCount === 0) {
      alert('No resumes to clear!');
      return;
    }

    const confirmMessage = `WARNING: This will permanently delete ALL ${resumeCount} saved resumes and auto-save data.\n\nThis action cannot be undone!\n\nAre you absolutely sure you want to continue?`;
    
    if (window.confirm(confirmMessage)) {
      const secondConfirm = window.confirm('FINAL CONFIRMATION: Delete all resumes permanently?');
      if (secondConfirm) {
        const result = clearAllResumes();
        if (result.success) {
          loadResumes();
          setSelectedResume(null);
          alert(result.message);
        } else {
          alert(result.message);
        }
      }
    }
  };

  const handleExportAllAsPDF = () => {
    const allResumes = resumes.map(meta => getResumeById(meta.id));
    const result = exportMultipleResumesAsPDF(allResumes, pdfTemplate);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleExportSinglePDF = (resumeId) => {
    const resume = getResumeById(resumeId);
    const result = exportResumeAsPDFWithTemplate(resume, pdfTemplate);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatEducation = (resume) => {
    if (!resume) return 'N/A';
    return (
      <div>
        <div><strong>10th:</strong> {resume.education_10th || 'N/A'}</div>
        <div><strong>12th:</strong> {resume.education_12th || 'N/A'}</div>
        <div><strong>Graduation:</strong> {resume.education_grad || 'N/A'}</div>
        <div><strong>Post-Graduation:</strong> {resume.education_pg || 'N/A'}</div>
      </div>
    );
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="text-center mb-4 fade-in">
            <div className="d-flex align-items-center justify-content-center mb-3">
              <div className="me-3 p-3 rounded-circle bg-primary text-white float-animation" style={{ fontSize: "1.5rem" }}>
                📁
              </div>
              <div>
                <h3 className="mb-1 text-gradient">Local Resume Storage</h3>
                <p className="text-muted mb-0">Manage your saved resumes with professional templates</p>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <span className="badge bg-primary rounded-pill me-2">{resumes.length}</span>
              <span className="text-muted">Saved Resumes</span>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="d-flex align-items-center me-2">
                <label className="form-label me-2 mb-0 small text-muted">Template:</label>
                <select 
                  className="form-select form-select-sm"
                  value={pdfTemplate}
                  onChange={(e) => setPdfTemplate(e.target.value)}
                >
                  <option value="professional">Professional</option>
                  <option value="modern">Modern</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
              
              <div className="btn-group shadow-sm">
                <button 
                  className="btn btn-outline-primary btn-sm rounded-pill me-1" 
                  onClick={loadResumes}
                  style={{ fontWeight: '500' }}
                >
                  <span className="me-1"></span> Refresh
                </button>
                <button 
                  className="btn btn-success btn-sm rounded-pill me-1" 
                  onClick={handleExportAllAsPDF}
                  style={{ fontWeight: '500' }}
                >
                  <span className="me-1"></span> Export All PDF
                </button>
                {resumes.length > 0 && (
                  <button 
                    className="btn btn-danger btn-sm rounded-pill" 
                    onClick={handleClearAllResumes}
                    style={{ fontWeight: '500' }}
                    title="Clear all saved resumes"
                  >
                    <span className="me-1"></span> Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {storageInfo && (
            <div className="alert alert-info">
              <strong>Storage Info:</strong> {storageInfo.totalResumes} resumes • 
              {storageInfo.storageUsed || 0}% of browser storage
            </div>
          )}

          {resumes.length === 0 ? (
            <div className="alert alert-warning">
              <strong>No Resumes Found</strong>
              <p className="mb-0">Complete the chat interface to save your first resume locally.</p>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-4">
                <h5>Saved Resumes ({resumes.length})</h5>
                <div className="list-group">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`list-group-item ${
                        selectedResume?.id === resume.id ? 'active' : ''
                      }`}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <button
                          className="btn btn-link p-0 text-start flex-grow-1"
                          onClick={() => handleSelectResume(resume.id)}
                        >
                          <h6 className="mb-1">{resume.name}</h6>
                          <small>{formatDate(resume.createdAt)}</small>
                        </button>
                        <div className="btn-group-vertical btn-group-sm">
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleExportSinglePDF(resume.id)}
                            title="Download as PDF"
                          >
                            PDF
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteResume(resume.id)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-md-8">
                {selectedResume ? (
                  <div className="card">
                    <div className="card-header">
                      <h5>Resume Details</h5>
                      <small className="text-muted">
                        Created: {formatDate(selectedResume.createdAt)} | 
                        Updated: {formatDate(selectedResume.updatedAt)} |
                        ID: {selectedResume.id}
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
                          {formatEducation(selectedResume)}
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

                      {selectedResume.internship_details && (
                        <>
                          <hr />
                          <h6>Internship Experience</h6>
                          <p>{selectedResume.internship_details}</p>
                        </>
                      )}

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

                      <hr />
                      <div className="text-center">
                        <button
                          className="btn btn-success me-2"
                          onClick={() => handleExportSinglePDF(selectedResume.id)}
                        >
                          Download as PDF
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteResume(selectedResume.id)}
                        >
                          Delete Resume
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-body text-center text-muted">
                      <h5>Select a resume to view details</h5>
                      <p>Click on a resume from the list to see its complete information.</p>
                      <div className="mt-3">
                        <h6>Export Options:</h6>
                        <ul className="list-unstyled">
                          <li><strong>PDF Export:</strong> Professional resume format (Primary)</li>
                          <li><strong>Multiple Templates:</strong> Professional, Modern, Creative</li>
                          <li><strong>Bulk Export:</strong> Export all resumes at once</li>
                          <li><strong>Offline Ready:</strong> No internet required</li>
                        </ul>
                        
                        <div className="mt-3">
                          <small className="text-muted">
                            <strong>Template Preview:</strong> {pdfTemplate.charAt(0).toUpperCase() + pdfTemplate.slice(1)} template selected
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
