import React, { useState } from "react";
import ChatInterface from "./components/ChatInterface";
import ResumePreview from "./components/ResumePreview";
import SimpleStorageViewer from "./components/SimpleStorageViewer";

function App() {
  const [resumeData, setResumeData] = useState(null);
  const [currentView, setCurrentView] = useState('builder'); // 'builder' or 'database'

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{ 
        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
        borderBottom: '3px solid rgba(255,255,255,0.1)'
      }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <div className="me-3 p-2 rounded-circle bg-white text-primary float-animation" style={{ fontSize: "1.2rem" }}>
              🤖
            </div>
            <span className="navbar-brand mb-0 h1" style={{ fontWeight: '700', fontSize: '1.5rem' }}>
              Smart Resume Builder
            </span>
            <span className="badge bg-light text-primary ms-2 rounded-pill" style={{ fontSize: '0.7rem' }}>
              AI-Powered
            </span>
          </div>
          
          <div className="navbar-nav ms-auto d-flex flex-row gap-2 align-items-center">
            <button 
              className={`btn btn-sm rounded-pill px-3 transition-all ${
                currentView === 'builder' 
                  ? 'btn-light text-primary shadow-sm' 
                  : 'btn-outline-light'
              }`}
              onClick={() => setCurrentView('builder')}
              style={{ 
                fontWeight: '600',
                transition: 'all 0.3s ease',
                border: currentView === 'builder' ? 'none' : '2px solid rgba(255,255,255,0.8)'
              }}
            >
              <span className="me-1"></span> Resume Builder
            </button>
            <button 
              className={`btn btn-sm rounded-pill px-3 transition-all ${
                currentView === 'database' 
                  ? 'btn-light text-primary shadow-sm' 
                  : 'btn-outline-light'
              }`}
              onClick={() => setCurrentView('database')}
              style={{ 
                fontWeight: '600',
                transition: 'all 0.3s ease',
                border: currentView === 'database' ? 'none' : '2px solid rgba(255,255,255,0.8)'
              }}
            >
              <span className="me-1"></span> Local Storage
            </button>
            
            <div className="d-none d-md-flex align-items-center ms-3 ps-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.3)' }}>
              <div className="d-flex flex-column align-items-end">
                <span className="text-light small mb-0" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                  ATS-Friendly • Voice Enabled
                </span>
                <span className="text-light small opacity-75" style={{ fontSize: '0.7rem' }}>
                  Professional Resume Templates
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid py-4">
        {currentView === 'builder' ? (
          <div className="row g-4">
            {/* Chat Interface */}
            <div className="col-lg-6">
              <div className="sticky-top" style={{ top: '20px' }}>
                <ChatInterface onComplete={setResumeData} />
              </div>
            </div>
            
            {/* Resume Preview */}
            <div className="col-lg-6">
              <ResumePreview data={resumeData} />
            </div>
          </div>
        ) : (
          <SimpleStorageViewer />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-8">
              <h6>Features</h6>
              <ul className="list-unstyled small">
                <li>Conversational chat interface with voice input</li>
                <li>AI-powered job keyword optimization</li>
                <li>Multiple professional resume templates</li>
                <li>ATS-friendly PDF export</li>
                <li>PDF export with multiple templates</li>
              </ul>
            </div>
            <div className="col-md-4 text-md-end">
              <h6>Tech Stack</h6>
              <p className="small mb-0">
                React.js • PDF Export • Local Storage • No Database Required
              </p>
              <p className="small text-muted mt-2">
                Built with MERN Stack
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
