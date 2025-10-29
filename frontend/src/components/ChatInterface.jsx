// src/components/ChatInterface.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { validators, isGibberish } from "../utils/validators";
import { validateField, autoSave, processSaveQueue, getSaveStatus, loadFromLocalStorage, isOnline, clearAllLocalData, saveResumeToMongoDB } from "../utils/simpleApi";

const STORAGE_KEY = "scrb_chat_draft_v1";
const AUTO_SAVE_INTERVAL = 30000; // Auto-save every 30 seconds (reduced frequency)
const DEBOUNCE_DELAY = 5000; // Wait 5 seconds after user stops typing (increased delay)

// Speech correction function for common misheard words
const applySpeechCorrections = (transcript) => {
  // Get custom corrections from localStorage
  const customCorrections = JSON.parse(localStorage.getItem('speech_corrections') || '{}');
  
  const corrections = {
    // Common misheard words/names - add more as needed
    'mamu': 'Mammiyoor',
    'mummy': 'Mammiyoor', 
    'mama': 'Mammiyoor',
    'mamur': 'Mammiyoor',
    'mamyu': 'Mammiyoor',
    'mamyur': 'Mammiyoor',
    'mamuyar': 'Mammiyoor',
    'mamuyour': 'Mammiyoor',
    'mamuyur': 'Mammiyoor',
    'mamayor': 'Mammiyoor',
    'mammiyur': 'Mammiyoor',
    'mammiyor': 'Mammiyoor',
    
    // Add other common corrections
    'react js': 'React.js',
    'node js': 'Node.js',
    'mongo db': 'MongoDB',
    'my sql': 'MySQL',
    'post gres': 'PostgreSQL',
    'java script': 'JavaScript',
    'type script': 'TypeScript',
    'next js': 'Next.js',
    'vue js': 'Vue.js',
    'angular js': 'AngularJS',
    'express js': 'Express.js',
    
    // Common skill corrections
    'html 5': 'HTML5',
    'css 3': 'CSS3',
    'bootstrap 4': 'Bootstrap 4',
    'bootstrap 5': 'Bootstrap 5',
    'git hub': 'GitHub',
    'git lab': 'GitLab',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'GCP',
    
    // Merge with custom corrections (custom ones take priority)
    ...customCorrections
  };
  
  let correctedTranscript = transcript;
  
  // Apply corrections (case-insensitive)
  Object.entries(corrections).forEach(([wrong, correct]) => {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    correctedTranscript = correctedTranscript.replace(regex, correct);
  });
  
  return correctedTranscript;
};

const steps = [
  { key: "name", label: "What’s your full name?", placeholder: "e.g., Priya Sharma", validator: validators.name, error: "Please enter a valid name." },
  { key: "email", label: "Great. What's your email?", placeholder: "e.g., priya123@example.com", validator: validators.email, error: "Please enter a valid email (no spaces allowed)." },
  { key: "phone", label: "Your mobile number?", placeholder: "10 digits", validator: validators.phone, error: "Phone must be exactly 10 digits." },

  { key: "education_10th", label: "Enter your 10th details (School, Year, %).", placeholder: "e.g., ABC School, 2018, 92%", validator: validators.education, error: "Please enter valid 10th details." },
  { key: "education_12th", label: "Enter your 12th details (School, Year, %).", placeholder: "e.g., XYZ School, 2020, 89%", validator: validators.education, error: "Please enter valid 12th details." },
  { key: "education_grad", label: "Enter your Graduation details (Degree, College, Year, CGPA).", placeholder: "e.g., B.Tech CSE, XYZ University, 2024, 8.2 CGPA", validator: validators.education, error: "Please enter valid graduation details." },

  {
    key: "education_pg",
    label: "Do you have Post-Graduation details? (Enter your details or type 'NA' if you don't have any)",
    type: "pg",
    placeholder: "e.g., M.Tech AI, ABC University, 2026, 8.5 CGPA or just type: NA",
    validator: (v) => v.trim().toLowerCase() === "na" || validators.education(v),
    error: "Please enter valid post-graduation details or type 'NA' if you don't have any."
  },

  { key: "technical_skills", label: "List your technical skills (comma-separated). You can add more later by typing 'add [new skills]'.", placeholder: "e.g., React, Node.js, MongoDB, Python, Java", validator: () => true, error: "" },
  { key: "soft_skills", label: "List your soft skills (comma-separated). You can add more later by typing 'add [new skills]'.", placeholder: "e.g., Leadership, Communication, Problem Solving, Teamwork", validator: validators.skills, error: "Please add at least one soft skill." },
  { key: "fresher_status", 
    label: "Are you a fresher? (Type 'Yes' if you're a fresher/recent graduate, 'No' if you have work experience)", 
    placeholder: "Type: Yes or No", 
    validator: (v) => v.trim().toLowerCase() === "yes" || v.trim().toLowerCase() === "no",
    error: "Please type 'Yes' if you're a fresher or 'No' if you have work experience."
  },
  { 
    key: "internships", 
    label: "Have you done any internships? (Type 'Yes' if you have internship experience, 'No' if you haven't)", 
    placeholder: "Type: Yes or No", 
    validator: (v) => v.trim().toLowerCase() === "yes" || v.trim().toLowerCase() === "no",
    error: "Please type 'Yes' if you have internship experience or 'No' if you haven't."
  },
  { 
    key: "internship_details", 
    label: "Great! Please describe your internship experience (1-3 internships, separate with '---').", 
    placeholder: "e.g., Software Development Intern at XYZ Company, worked on React projects for 3 months --- Data Science Intern at ABC Corp, analyzed customer data using Python for 2 months", 
    validator: validators.experience, // Reuse experience validator
    error: "Please add valid internship details with company name, role, and duration."
  },
  { 
    key: "certifications", 
    label: "Do you have any certifications? (Enter certification name and provider, separate multiple with '---', or type 'NA' if none)", 
    placeholder: "e.g., AWS Certified Cloud Practitioner - Amazon Web Services --- Google Analytics Certified - Google --- or just type: NA", 
    validator: validators.certifications,
    error: "Please enter valid certification details or type 'NA' if you don't have any certifications."
  },
  { key: "experience", label: "Describe your work experience (1-3 experiences, separate with '---').", placeholder: "e.g., Software Developer at XYZ Company, worked on web applications using React and Node.js for 2 years --- Intern at ABC Corp, developed mobile apps using Flutter", validator: validators.experience, error: "Please add valid work experience details." },
  { key: "projects", label: "Describe your key projects (1-3 projects, separate with '---').", placeholder: "e.g., E-commerce Website: Built MERN stack app with payment integration --- Chat App: Real-time messaging using Socket.io and React --- Portfolio: Personal website using Next.js", validator: validators.projects, error: "Please add valid project details." }
];

function Bubble({ role, children }) {
  const isUser = role === "user";
  return (
    <div className={`d-flex ${isUser ? "justify-content-end" : "justify-content-start"} my-3 chat-bubble`}>
      <div 
        className={`p-3 rounded-4 shadow-sm position-relative ${
          isUser 
            ? "bg-primary text-white" 
            : "bg-white border border-light"
        }`} 
        style={{ 
          maxWidth: "85%",
          animation: "slideInChat 0.4s ease-out",
          ...(isUser ? {
            background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
            boxShadow: "0 4px 15px rgba(0, 123, 255, 0.3)"
          } : {
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)"
          })
        }}
      >
        {/* Avatar */}
        <div 
          className={`position-absolute rounded-circle d-flex align-items-center justify-content-center ${
            isUser ? "bg-white text-primary" : "bg-primary text-white"
          }`}
          style={{
            width: "24px",
            height: "24px",
            fontSize: "12px",
            fontWeight: "bold",
            top: "-8px",
            [isUser ? "right" : "left"]: "-8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
          }}
        >
          {isUser ? "👤" : "🤖"}
        </div>
        
        {typeof children === 'string' && children.includes(':') && children.includes('\n') ? (
          <div>
            {children.split('\n').map((line, index) => {
              if (line.includes(':')) {
                const [category, skills] = line.split(':');
                return (
                  <div key={index} className="mb-1">
                    <strong>{category}:</strong> {skills}
                  </div>
                );
              }
              return <div key={index}>{line}</div>;
            })}
          </div>
        ) : (
          <div style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatInterface({ onComplete }) {
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_msgs");
    return saved ? JSON.parse(saved) : [{ role: "system", content: steps[0].label }];
  });

  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_idx");
    return saved ? Number(saved) : 0;
  });

  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechCorrection, setSpeechCorrection] = useState("");
  
  // Auto-save states
  const [saveStatus, setSaveStatus] = useState({ status: 'idle', message: '', timestamp: null });
  const [isOnlineStatus, setIsOnlineStatus] = useState(isOnline());
  const autoSaveTimeoutRef = useRef(null);
  const periodicSaveIntervalRef = useRef(null);
  const lastSavedDataRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), [currentStep]);
  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  // Separate effect for localStorage draft saving (frequent, lightweight)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    localStorage.setItem(STORAGE_KEY + "_msgs", JSON.stringify(messages));
    localStorage.setItem(STORAGE_KEY + "_idx", String(currentStep));
  }, [answers, messages, currentStep]);

  // Separate effect for auto-save (less frequent, only when meaningful data changes)
  useEffect(() => {
    if (Object.keys(answers).length > 0 && hasMinimumResumeContent(answers)) {
      // Check if data actually changed to prevent duplicate saves
      const currentDataString = JSON.stringify(answers);
      if (lastSavedDataRef.current !== currentDataString) {
        triggerAutoSave();
      }
    }
  }, [answers]); // Only trigger on answers change, not messages or currentStep

  // Auto-save functionality
  const triggerAutoSave = () => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for debounced save
    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, DEBOUNCE_DELAY);
  };
  
  // Check if resume has meaningful content worth saving
  const hasMinimumResumeContent = (data) => {
    // Must have at least basic personal info AND some substantial content
    const hasBasicInfo = data.name && data.email && data.phone;
    const hasEducation = data.education_10th || data.education_12th || data.education_grad;
    const hasSkills = data.technical_skills || data.soft_skills;
    const hasExperience = data.experience || data.projects || data.internship_details;
    
    // Only save if we have basic info AND at least 2 other meaningful sections
    const meaningfulSections = [hasEducation, hasSkills, hasExperience].filter(Boolean).length;
    
    return hasBasicInfo && meaningfulSections >= 1;
  };

  const performAutoSave = async () => {
    if (Object.keys(answers).length === 0) return;
    
    // Don't auto-save if resume doesn't have meaningful content
    if (!hasMinimumResumeContent(answers)) {
      console.log('Skipping auto-save: insufficient resume content');
      return;
    }

    // Prevent duplicate saves by checking if data changed
    const currentDataString = JSON.stringify(answers);
    if (lastSavedDataRef.current === currentDataString) {
      console.log('Skipping auto-save: data unchanged');
      return;
    }
    
    setSaveStatus({ status: 'saving', message: 'Saving...', timestamp: new Date() });
    
    try {
      const result = await autoSave(answers);
      
      // Mark this data as saved
      lastSavedDataRef.current = currentDataString;
      
      setSaveStatus({
        status: result.savedToMongoDB ? 'saved' : 'local',
        message: result.message,
        timestamp: new Date()
      });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, status: 'idle', message: '' }));
      }, 3000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus({
        status: 'error',
        message: 'Save failed',
        timestamp: new Date()
      });
    }
  };
  
  // Online/offline detection
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnlineStatus(true);
      setSaveStatus({ status: 'syncing', message: 'Syncing...', timestamp: new Date() });
      
      try {
        const result = await processSaveQueue();
        if (result.processed > 0) {
          setSaveStatus({
            status: 'synced',
            message: `Synced ${result.processed} pending saves`,
            timestamp: new Date()
          });
        } else {
          setSaveStatus({ status: 'idle', message: '', timestamp: new Date() });
        }
      } catch (error) {
        console.error('Sync error:', error);
        setSaveStatus({
          status: 'error',
          message: 'Sync failed',
          timestamp: new Date()
        });
      }
    };
    
    const handleOffline = () => {
      setIsOnlineStatus(false);
      setSaveStatus({
        status: 'offline',
        message: 'Offline - saving locally',
        timestamp: new Date()
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Periodic auto-save
  useEffect(() => {
    periodicSaveIntervalRef.current = setInterval(() => {
      if (Object.keys(answers).length > 0 && hasMinimumResumeContent(answers)) {
        performAutoSave();
      }
    }, AUTO_SAVE_INTERVAL);
    
    return () => {
      if (periodicSaveIntervalRef.current) {
        clearInterval(periodicSaveIntervalRef.current);
      }
    };
  }, [answers]);
  
  // Cleanup voice recognition when component unmounts
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (periodicSaveIntervalRef.current) {
        clearInterval(periodicSaveIntervalRef.current);
      }
    };
  }, [recognition]);

  const saveToStorage = async (data) => {
    try {
      console.log('Saving resume:', data);
      const result = await saveResumeToMongoDB(data); // This now saves to localStorage via simpleApi
      
      if (result.success) {
        console.log('Saved successfully:', result.resumeId);
        // Show success message to user
        setMessages(prev => [...prev, { 
          role: "system", 
          content: `Your resume has been saved! Resume ID: ${result.resumeId}` 
        }]);
      } else {
        console.error('Failed to save:', result.message);
        setMessages(prev => [...prev, { 
          role: "system", 
          content: `Note: ${result.message}` 
        }]);
      }
    } catch (error) {
      console.error('Error saving to MongoDB:', error);
      setMessages(prev => [...prev, { 
        role: "system", 
        content: "Note: Could not save to database, but your data is stored locally." 
      }]);
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setError("");
      
      console.log('Form submitted:', { currentStep, stepsLength: steps.length, input: input.trim() });

      // Check if we're past the last step
      if (currentStep >= steps.length) {
        console.log('Blocked: currentStep >= steps.length');
        return;
      }

    const step = steps[currentStep];
    const value = input.trim();
    
    console.log('Validating:', { step: step?.key, value, validator: typeof step?.validator });

    // Basic field validation
    if (!step.validator(value)) {
      console.log('Validation failed:', step.error);
      return setError(step.error);
    }
    // Gibberish check (pass field type for context-aware validation)
    let fieldType = 'general';
    if (step.key === 'name') fieldType = 'name';
    else if (step.key === 'email') fieldType = 'email';
    else if (step.key === 'phone') fieldType = 'phone';
    else if (step.key.startsWith('education_')) fieldType = 'education';
    else if (step.key === 'technical_skills') fieldType = 'technical_skills';
    else if (step.key === 'soft_skills') fieldType = 'skills';
    else if (step.key === 'experience') fieldType = 'experience';
    else if (step.key === 'internship_details') fieldType = 'experience'; // Use same validation as experience
    else if (step.key === 'projects') fieldType = 'projects';
    else if (step.key === 'fresher_status' || step.key === 'internships') fieldType = 'fresher_status';
    
    if (isGibberish(value, fieldType)) {
      console.log('Gibberish detected for field:', step.key);
      return setError("🤔 That looks like gibberish. Please try again.");
    }
    // Backend NLP sanity check (temporarily disabled for testing)
    // const result = await validateField(step.key, value);
    // if (!result.success) return setError(result.message);

    // Stop any active voice recognition before proceeding
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }

    // Save valid response
    console.log('Validation passed, saving answer');
    // Handle skills appending logic
    let finalValue = value;
    let isAppending = false;
    
    if ((step.key === 'technical_skills' || step.key === 'soft_skills') && answers[step.key]) {
      // Check if user wants to append (contains words like "add", "also", "more", etc.)
      const appendKeywords = ['add', 'also', 'more', 'plus', 'and', 'additionally', 'include'];
      const lowerValue = value.toLowerCase();
      const hasAppendKeyword = appendKeywords.some(keyword => lowerValue.includes(keyword));
      
      // If user starts with append keywords or uses "," to continue
      if (hasAppendKeyword || lowerValue.startsWith(',')) {
        const existingSkills = answers[step.key];
        // Remove append keywords and clean up the input
        let cleanValue = value.replace(/^(add|also|more|plus|and|additionally|include)\s*/i, '');
        cleanValue = cleanValue.replace(/^,\s*/, ''); // Remove leading comma
        
        if (cleanValue.trim()) {
          finalValue = `${existingSkills}, ${cleanValue}`;
          isAppending = true;
        } else {
          finalValue = existingSkills; // Keep existing if no new skills provided
        }
      }
    }

    const nextAnswers = { ...answers, [step.key]: finalValue };
    setAnswers(nextAnswers);
    // For technical skills, show categorization
    let userMessage = value;
    let systemResponse = "";
    
    if (step.key === 'soft_skills' && isAppending) {
      systemResponse = `Perfect! I've added your new soft skills. Your complete list is now: ${finalValue}`;
    }

    const nextMessages = [...messages, { role: "user", content: userMessage }];
    
    // Add system response for technical skills categorization
    if (systemResponse) {
      nextMessages.push({ role: "system", content: systemResponse });
    }
    
    let nextIndex = currentStep + 1;

    // Handle conditional flow based on fresher status and internships
    if (step.key === 'fresher_status') {
      const isFresher = value.trim().toLowerCase() === 'yes';
      console.log('Fresher status:', isFresher);
      
      if (isFresher) {
        // Go to internships
        const internshipsIndex = steps.findIndex(s => s.key === 'internships');
        console.log('Internships index:', internshipsIndex);
        nextIndex = internshipsIndex !== -1 ? internshipsIndex : steps.length;
      } else {
        // Go to experience
        const experienceIndex = steps.findIndex(s => s.key === 'experience');
        console.log('Experience index:', experienceIndex);
        nextIndex = experienceIndex !== -1 ? experienceIndex : steps.length;
      }
    } else if (step.key === 'internships') {
      const hasInternships = value.trim().toLowerCase() === 'yes';
      console.log('Has internships:', hasInternships);
      
      if (hasInternships) {
        // Go to internship details
        const internshipDetailsIndex = steps.findIndex(s => s.key === 'internship_details');
        console.log('Internship details index:', internshipDetailsIndex);
        nextIndex = internshipDetailsIndex !== -1 ? internshipDetailsIndex : steps.length;
      } else {
        // Skip internship details, go to projects
        const projectsIndex = steps.findIndex(s => s.key === 'projects');
        console.log('Projects index:', projectsIndex);
        nextIndex = projectsIndex !== -1 ? projectsIndex : steps.length;
      }
    } else if (step.key === 'internship_details') {
      // After internship details, go to projects
      const projectsIndex = steps.findIndex(s => s.key === 'projects');
      console.log('Projects index:', projectsIndex);
      nextIndex = projectsIndex !== -1 ? projectsIndex : steps.length;
    } else if (step.key === 'experience') {
      // After experience, go to projects
      const projectsIndex = steps.findIndex(s => s.key === 'projects');
      console.log('Projects index:', projectsIndex);
      nextIndex = projectsIndex !== -1 ? projectsIndex : steps.length;
    } else if (step.key === 'projects') {
      // After projects, we're done
      nextIndex = steps.length;
    }

    if (nextIndex < steps.length) {
      console.log('Moving to next step:', nextIndex);
      nextMessages.push({ role: "system", content: steps[nextIndex].label });
      setMessages(nextMessages);
      setCurrentStep(nextIndex);
      setInput("");
    } else {
      console.log('Completed all steps');
      nextMessages.push({ role: "system", content: "Thanks! You've completed the intake." });
      setMessages(nextMessages);
      
      // Save to storage when intake is complete
      await saveToStorage(nextAnswers);
      
      onComplete?.(nextAnswers);
    }
    } catch (error) {
      console.error('Error in form submission:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const handleVoiceInput = async () => {
    try {
      // Check browser support first
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError("Speech recognition not supported. Please use Chrome, Edge, or Safari.");
        return;
      }

      if (isListening) {
        // Stop listening
        if (recognition) {
          try {
            recognition.stop();
          } catch (stopError) {
            console.log("Error stopping recognition:", stopError);
          }
        }
        setIsListening(false);
        setError("");
        setSpeechCorrection("");
        return;
      }

      // Clear any previous errors
      setError("");
      setSpeechCorrection("");

      // Start listening
      const newRecognition = new SpeechRecognition();
      newRecognition.lang = "en-US"; // Use en-US for better compatibility
      newRecognition.continuous = false;
      newRecognition.interimResults = true;
      newRecognition.maxAlternatives = 1; // Reduce to 1 for better performance
      
      newRecognition.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
        setError(""); // Clear any previous errors
      };
      
      newRecognition.onresult = (e) => {
        console.log("Speech recognition result:", e);
        let transcript = '';
        
        // Get the best result
        for (let i = 0; i < e.results.length; i++) {
          const result = e.results[i];
          if (result.isFinal) {
            transcript += result[0].transcript;
          }
        }
        
        if (transcript.trim()) {
          // Apply speech corrections for common misheard words
          const originalTranscript = transcript;
          const correctedTranscript = applySpeechCorrections(transcript);
          
          // Show correction message if changes were made
          if (originalTranscript !== correctedTranscript) {
            setSpeechCorrection(`Auto-corrected: "${originalTranscript}" → "${correctedTranscript}"`);
            setTimeout(() => setSpeechCorrection(""), 4000);
          } else {
            setSpeechCorrection("");
          }
          
          setInput(correctedTranscript);
        }
      };
      
      newRecognition.onend = () => {
        setIsListening(false);
      };
      
      newRecognition.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        setIsListening(false);
        
        // Handle specific errors with helpful messages
        switch (e.error) {
          case 'no-speech':
            setError("No speech detected. Please speak clearly and try again.");
            break;
          case 'audio-capture':
            setError("Microphone not accessible. Please check your microphone settings.");
            break;
          case 'not-allowed':
            setError("Microphone permission denied. Please allow microphone access and try again.");
            break;
          case 'network':
            setError("Network error. Please check your internet connection.");
            break;
          case 'aborted':
            // Don't show error for aborted - user likely stopped it intentionally
            break;
          default:
            setError("Voice input failed. Please try again or type your response.");
        }
      };
      
      setRecognition(newRecognition);
      
      // Start recognition
      try {
        newRecognition.start();
        console.log("Starting speech recognition...");
      } catch (startError) {
        console.error("Failed to start recognition:", startError);
        setError("Failed to start voice input. Please try again.");
        setIsListening(false);
      }
      
    } catch (err) {
      console.error("Voice input setup failed:", err);
      setError("Voice input not available. Please type your response.");
      setIsListening(false);
    }
  };

  const handleClear = () => {
    if (!window.confirm("Clear all entered details?")) return;
    // Clear all localStorage data including auto-save data
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY + "_msgs");
    localStorage.removeItem(STORAGE_KEY + "_idx");
    localStorage.removeItem('scrb_auto_save_data');
    localStorage.removeItem('scrb_save_queue');
    localStorage.removeItem('scrb_last_save_timestamp');
    
    setAnswers({});
    setMessages([{ role: "system", content: steps[0].label }]);
    setCurrentStep(0);
    setInput("");
    setError("");
    setSaveStatus({ status: 'idle', message: '', timestamp: null });
  };

  const handleForceReset = () => {
    // Force reset without confirmation - for debugging
    localStorage.clear(); // Clear ALL localStorage
    window.location.reload();
  };


  return (
    <div className="container py-4">
      <div className="mx-auto" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <div className="me-3 p-2 rounded-circle bg-primary text-white" style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              🤖
            </div>
            <div>
              <h4 className="mb-1 text-gradient">Smart Resume Chat</h4>
              <small className="text-muted">AI-powered resume builder with voice support</small>
            </div>
          </div>
          
          
          {/* Save Status Indicator */}
          {saveStatus.message && (
            <div className={`alert py-2 mt-3 mb-0 rounded-3 ${
              saveStatus.status === 'saved' || saveStatus.status === 'synced' ? 'alert-success' :
              saveStatus.status === 'error' ? 'alert-danger' :
              saveStatus.status === 'offline' ? 'alert-warning' :
              'alert-info'
            }`} style={{ fontSize: '0.85em', maxWidth: '450px', margin: '12px auto 0', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <div className="d-flex align-items-center justify-content-center">
                <span>{saveStatus.message}</span>
                {!isOnlineStatus && (
                  <span className="ms-2 badge bg-warning text-dark rounded-pill">Offline</span>
                )}
                {getSaveStatus().queuedSaves > 0 && (
                  <span className="ms-2 badge bg-info rounded-pill">{getSaveStatus().queuedSaves} queued</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="card shadow-soft border-0" style={{ borderRadius: "16px", overflow: "hidden" }}>
          <div 
            className="card-body p-4" 
            style={{ 
              height: 480, 
              overflowY: "auto",
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              backgroundImage: "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.03) 0%, transparent 50%)"
            }}
          >
            {messages.length === 1 && (
              <div className="text-center mb-4 fade-in">
                <h5 className="text-primary mb-2">Welcome to Smart Resume Builder!</h5>
                <p className="text-muted small mb-0">I'll help you create a professional resume step by step.</p>
              </div>
            )}
            {messages.map((m, i) => <Bubble key={i} role={m.role}>{m.content}</Bubble>)}
            <div ref={chatEndRef} />
          </div>

          {/* Input Section */}
          <div className="card-footer bg-white border-0 p-4">
            <form onSubmit={handleSubmit}>
              <div className="d-flex align-items-center mb-3">
                <div className="me-2 p-2 rounded-circle bg-light text-primary" style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                  {currentStep + 1}
                </div>
                <label className="form-label fw-semibold mb-0 flex-grow-1" style={{ fontSize: "1.05rem", color: "#495057" }}>
                  {steps[currentStep]?.label}
                </label>
              </div>
              
              {/* Show current skills if user is on skills step and has existing skills */}
              {(steps[currentStep]?.key === 'technical_skills' || steps[currentStep]?.key === 'soft_skills') && 
               answers[steps[currentStep]?.key] && (
                <div className="alert alert-info py-3 mb-3 border-0 rounded-3" style={{ fontSize: '0.9em', background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                  <div className="d-flex align-items-start">
                    <div className="me-2 text-info" style={{ fontSize: '1.2em' }}>💡</div>
                    <div className="flex-grow-1">
                      <strong className="text-info">Current {steps[currentStep]?.key === 'technical_skills' ? 'Technical' : 'Soft'} Skills:</strong>
                      <div className="mt-1 mb-2">
                        <span className="badge bg-light text-dark me-1" style={{ fontSize: '0.85em' }}>
                          {answers[steps[currentStep]?.key]}
                        </span>
                      </div>
                      <small className="text-muted">
                        <strong>Tip:</strong> To add more skills, type: "add [new skills]" or just ",[new skills]"
                      </small>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="input-group position-relative" style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 15px rgba(0,0,0,0.1)" }}>
                <input
                  ref={inputRef}
                  type="text"
                  className={`form-control border-0 ${error ? "is-invalid" : ""}`}
                  placeholder={steps[currentStep]?.placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={currentStep >= steps.length}
                  style={{ 
                    fontSize: "1rem", 
                    padding: "16px 20px",
                    background: "#fff",
                    borderRadius: "12px 0 0 12px"
                  }}
                />
                <button 
                  className="btn btn-primary border-0" 
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                    padding: "16px 24px",
                    fontWeight: "600",
                    borderRadius: "0"
                  }}
                >
                  <span className="me-1">Send</span>
                </button>
                <button 
                  type="button" 
                  className={`btn border-0 ${isListening ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={handleVoiceInput}
                  title={isListening ? "Click to stop listening" : "Click to start voice input"}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "0 12px 12px 0",
                    ...(isListening ? {
                      background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                      animation: "pulse 1.5s infinite"
                    } : {
                      background: "#f8f9fa",
                      color: "#6c757d"
                    })
                  }}
                >
                  {isListening ? 'Stop' : 'Voice'}
                </button>
                {isListening && (
                  <div className="position-absolute" style={{ 
                    top: '-45px', 
                    right: '10px', 
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
                    color: 'white', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    fontSize: '0.8em',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                    animation: 'bounce 1s infinite'
                  }}>
                    <div className="d-flex align-items-center">
                      <span className="me-2"></span>
                      <span>Listening... Speak clearly</span>
                    </div>
                  </div>
                )}
              </div>
              {error && <div className="invalid-feedback d-block mt-1">{error}</div>}
              {speechCorrection && (
                <div className="alert alert-success py-1 mt-2 mb-0" style={{ fontSize: '0.85em' }}>
                  {speechCorrection}
                </div>
              )}
              
              {/* Voice troubleshooting tips */}
              {error && error.includes('Voice input') && (
                <div className="alert alert-info py-2 mt-2 mb-0" style={{ fontSize: '0.8em' }}>
                  <strong>Voice Input Tips:</strong><br />
                  • Make sure microphone is connected and working<br />
                  • Allow microphone permission when prompted<br />
                  • Try refreshing the page (Ctrl+F5)<br />
                  • Use Chrome or Edge for best compatibility<br />
                  • Close other apps that might be using your microphone
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4 px-3">
          {/* Reset Chat Button */}
          <button 
            className="btn btn-outline-secondary btn-sm rounded-pill px-3" 
            onClick={handleClear}
            style={{ fontSize: "0.85rem", fontWeight: "500" }}
            title="Reset chat conversation"
          >
            Reset Chat
          </button>

          {/* Clear All Storage Button */}
          <button 
            className="btn btn-outline-danger btn-sm rounded-pill px-3" 
            onClick={() => {
              if (window.confirm('This will clear ALL data including saved resumes and auto-save data. Continue?')) {
                clearAllLocalData();
                window.location.reload();
              }
            }}
            style={{ fontSize: "0.85rem", fontWeight: "500" }}
            title="Clear all saved data"
          >
            Clear All Storage
          </button>

          {/* Save Resume Button - only show when there's meaningful data */}
          {Object.keys(answers).length > 0 && hasMinimumResumeContent(answers) && (
            <button 
              className="btn btn-success btn-sm rounded-pill px-3" 
              onClick={() => performAutoSave()}
              disabled={saveStatus.status === 'saving'}
              style={{ fontSize: "0.85rem", fontWeight: "500" }}
              title="Save resume to local storage"
            >
              {saveStatus.status === 'saving' ? (
                <><span className="spinner-border spinner-border-sm me-1"></span> Saving...</>
              ) : (
                <>Save</>
              )}
            </button>
          )}
        </div>
        
        {/* Save Status Footer */}
        <div className="text-center mt-3">
          <div className="d-inline-flex align-items-center gap-3 px-3 py-2 bg-light rounded-pill" style={{ fontSize: "0.85rem" }}>
            <span className="d-flex align-items-center">
              <span className="me-1">{isOnlineStatus ? '●' : '●'}</span>
              <span className="text-muted">{isOnlineStatus ? 'Online' : 'Offline'}</span>
            </span>
            <span className="text-muted">•</span>
            <span className="text-muted">
              Last save: {saveStatus.timestamp ? saveStatus.timestamp.toLocaleTimeString() : 'Never'}
            </span>
            {getSaveStatus().queuedSaves > 0 && (
              <>
                <span className="text-muted">•</span>
                <span className="badge bg-info rounded-pill">
                  {getSaveStatus().queuedSaves} queued
                </span>
              </>
            )}
          </div>
          <br />
          <small className="text-info mt-2 d-block">
Click "Local Storage" in the header to view all saved resumes from your browser storage
          </small>
        </div>
      </div>
    </div>
  );
}
