import React, { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { downloadJSON } from "../utils/download";
import PDFResume from "./PDFResume";
import JobOptimizer from "./JobOptimizer";
import { 
  RESUME_PERSONAS, 
  TEMPLATE_METADATA, 
  formatEducation, 
  formatSkills,
  generateSummary,
  getTemplateStyles
} from "../templates/resumeTemplates";

export default function ResumePreview({ data }) {
  const [selectedPersona, setSelectedPersona] = useState(RESUME_PERSONAS.PROFESSIONAL);
  const [showJobOptimizer, setShowJobOptimizer] = useState(false);
  const [optimizationData, setOptimizationData] = useState(null);

  if (!data) {
    return (
      <div className="p-3">
        <div className="card shadow-sm">
          <div className="card-body text-center">
            <h4 className="mb-3">📄 Resume Preview</h4>
            <p className="text-muted">Fill details in the chat to see your resume here.</p>
            <div className="mt-4">
              <small className="text-muted">
                ✨ Features available after completion:
              </small>
              <ul className="list-unstyled mt-2 small text-muted">
                <li>✓ Multiple professional templates</li>
                <li>✓ ATS-friendly PDF export</li>
                <li>✓ Job-aware keyword optimization</li>
                <li>✓ Real-time preview</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const templateStyles = getTemplateStyles(selectedPersona);
  const education = formatEducation(data);
  
  // Combine technical and soft skills for display
  const allSkills = [];
  if (data.technical_skills) {
    const techSkills = formatSkills(data.technical_skills || '');
    allSkills.push(...techSkills);
  }
  if (data.soft_skills) {
    const softSkills = formatSkills(data.soft_skills || '');
    allSkills.push(...softSkills);
  }
  // Fallback to data.skills if the above fields don't exist
  if (allSkills.length === 0 && data.skills) {
    allSkills.push(...formatSkills(data.skills || ''));
  }
  
  const skills = allSkills;
  const summary = generateSummary({ ...data, skills: allSkills }, selectedPersona);

  return (
    <div className="p-3">
      {/* Template Selector */}
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-white">
          <h5 className="mb-0">🎨 Choose Template</h5>
        </div>
        <div className="card-body">
          <div className="row g-2">
            {Object.entries(TEMPLATE_METADATA).map(([key, template]) => (
              <div key={key} className="col-6 col-md-3">
                <button
                  className={`btn w-100 ${selectedPersona === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedPersona(key)}
                  style={{ fontSize: '0.85rem' }}
                >
                  <div>{template.icon}</div>
                  <small>{template.name}</small>
                </button>
              </div>
            ))}
          </div>
          <small className="text-muted d-block mt-2">
            {TEMPLATE_METADATA[selectedPersona].description}
          </small>
        </div>
      </div>

      {/* Resume Preview */}
      <div 
        className="card shadow-sm mb-3" 
        style={{ 
          minHeight: "60vh", 
          maxHeight: "70vh",
          overflowY: "auto"
        }}
      >
        <div className="card-body" style={{ fontFamily: templateStyles.fontFamily }}>
          {/* Header */}
          <div 
            className="pb-3 mb-3" 
            style={{ 
              borderBottom: `3px solid ${templateStyles.primaryColor}` 
            }}
          >
            <h3 
              className="mb-1" 
              style={{ 
                color: templateStyles.primaryColor,
                fontSize: `${templateStyles.headerSize}px`
              }}
            >
              {data.name || "Your Name"}
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              {data.email || "youremail@example.com"} | {data.phone || "1234567890"}
            </p>
          </div>

          {/* Objective */}
          <div className="mb-4">
            <h5 
              className="mb-2" 
              style={{ 
                color: templateStyles.primaryColor,
                borderBottom: `2px solid ${templateStyles.accentColor}`,
                paddingBottom: '5px'
              }}
            >
              OBJECTIVE
            </h5>
            <p style={{ fontSize: '0.95rem', textAlign: 'justify' }}>
              {summary}
            </p>
          </div>

          {/* Education */}
          <div className="mb-4">
            <h5 
              className="mb-2" 
              style={{ 
                color: templateStyles.primaryColor,
                borderBottom: `2px solid ${templateStyles.accentColor}`,
                paddingBottom: '5px'
              }}
            >
              EDUCATION
            </h5>
            {education.map((edu, index) => (
              <div key={index} className="mb-2">
                <strong style={{ color: templateStyles.accentColor }}>
                  {edu.level}
                </strong>
                <p className="mb-1 ms-3" style={{ fontSize: '0.9rem' }}>
                  {edu.details}
                </p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="mb-4">
            <h5 
              className="mb-2" 
              style={{ 
                color: templateStyles.primaryColor,
                borderBottom: `2px solid ${templateStyles.accentColor}`,
                paddingBottom: '5px'
              }}
            >
              SKILLS
            </h5>
            
            {/* Technical Skills */}
            {data.technical_skills && (
              <div className="mb-3">
                <h6 className="mb-2" style={{ color: templateStyles.accentColor }}>
                  Technical Skills:
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {formatSkills(data.technical_skills || '').map((skill, index) => (
                    <span 
                      key={index}
                      className="badge"
                      style={{ 
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        fontSize: '0.85rem',
                        fontWeight: 'normal',
                        padding: '6px 12px'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Soft Skills */}
            {data.soft_skills && (
              <div className="mb-3">
                <h6 className="mb-2" style={{ color: templateStyles.accentColor }}>
                  Soft Skills:
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {formatSkills(data.soft_skills || '').map((skill, index) => (
                    <span 
                      key={index}
                      className="badge"
                      style={{ 
                        backgroundColor: '#f3e5f5',
                        color: '#7b1fa2',
                        fontSize: '0.85rem',
                        fontWeight: 'normal',
                        padding: '6px 12px'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Fallback for combined skills */}
            {!data.technical_skills && !data.soft_skills && skills.length > 0 && (
              <div className="d-flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="badge"
                    style={{ 
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                      fontSize: '0.85rem',
                      fontWeight: 'normal',
                      padding: '6px 12px'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Internships */}
          {data.internship_details && (
            <div className="mb-4">
              <h5 
                className="mb-2" 
                style={{ 
                  color: templateStyles.primaryColor,
                  borderBottom: `2px solid ${templateStyles.accentColor}`,
                  paddingBottom: '5px'
                }}
              >
                INTERNSHIP EXPERIENCE
              </h5>
              <div>
                {data.internship_details
                  .split('---')
                  .map((internship, index) => (
                    <div key={index} className="mb-2">
                      <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                        <strong>•</strong> {internship.trim()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Professional Experience */}
          {data.experience && (
            <div className="mb-4">
              <h5 
                className="mb-2" 
                style={{ 
                  color: templateStyles.primaryColor,
                  borderBottom: `2px solid ${templateStyles.accentColor}`,
                  paddingBottom: '5px'
                }}
              >
                PROFESSIONAL EXPERIENCE
              </h5>
              <div>
                {data.experience
                  .split('---')
                  .map((exp, index) => (
                    <div key={index} className="mb-2">
                      <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                        <strong>•</strong> {exp.trim()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {data.projects && (
            <div className="mb-3">
              <h5 
                className="mb-2" 
                style={{ 
                  color: templateStyles.primaryColor,
                  borderBottom: `2px solid ${templateStyles.accentColor}`,
                  paddingBottom: '5px'
                }}
              >
                PROJECTS
              </h5>
              <div>
                {data.projects
                  .split('---')
                  .map((project, index) => (
                    <div key={index} className="mb-2">
                      <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                        <strong>•</strong> {project.trim()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Fallback message if no experience/projects/internships */}
          {!data.experience && !data.projects && !data.internship_details && (
            <div className="mb-3">
              <h5 
                className="mb-2" 
                style={{ 
                  color: templateStyles.primaryColor,
                  borderBottom: `2px solid ${templateStyles.accentColor}`,
                  paddingBottom: '5px'
                }}
              >
                EXPERIENCE & PROJECTS
              </h5>
              <p style={{ fontSize: '0.95rem' }}>
                No experience, internships, or projects provided
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-grid gap-2">
            <PDFDownloadLink
              document={<PDFResume data={data} persona={selectedPersona} />}
              fileName={`resume-${data.name?.replace(/\s+/g, '-').toLowerCase() || 'draft'}.pdf`}
              className="btn btn-primary btn-lg"
            >
              {({ loading }) => (
                loading ? '⏳ Generating PDF...' : '📥 Download ATS-Friendly PDF'
              )}
            </PDFDownloadLink>
            
            <button 
              className="btn btn-outline-secondary"
              onClick={() => downloadJSON(data, "resume-data.json")}
            >
              💾 Export Data (JSON)
            </button>

            <button 
              className="btn btn-outline-info"
              onClick={() => setShowJobOptimizer(!showJobOptimizer)}
            >
              {showJobOptimizer ? '✕ Close' : '🎯 Optimize for Job'}
            </button>
          </div>

          {showJobOptimizer && (
            <div className="mt-3">
              <JobOptimizer 
                resumeData={data}
                onOptimizationComplete={setOptimizationData}
              />
            </div>
          )}

          {optimizationData && (
            <div className="mt-3 alert alert-success">
              <strong>✅ Optimization Complete!</strong>
              <br />
              <small>
                Match Score: <strong>{optimizationData.matchScore}%</strong> | 
                Matched Keywords: <strong>{optimizationData.matchedKeywords?.length || 0}</strong> | 
                Missing Keywords: <strong>{optimizationData.missingKeywords?.length || 0}</strong>
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
