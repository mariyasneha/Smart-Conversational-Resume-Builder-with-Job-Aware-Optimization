// Simple storage solution without database
const RESUME_STORAGE_KEY = 'resume_builder_data';
const RESUMES_LIST_KEY = 'resume_builder_list';

// Save a resume with timestamp and ID
export function saveResume(resumeData) {
  try {
    const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const resumeWithMeta = {
      ...resumeData,
      id: resumeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save individual resume
    localStorage.setItem(`${RESUME_STORAGE_KEY}_${resumeId}`, JSON.stringify(resumeWithMeta));
    
    // Update resumes list
    const resumesList = getResumesList();
    const existingIndex = resumesList.findIndex(r => r.id === resumeId);
    
    if (existingIndex >= 0) {
      resumesList[existingIndex] = {
        id: resumeId,
        name: resumeData.name || 'Untitled Resume',
        createdAt: resumeWithMeta.createdAt,
        updatedAt: resumeWithMeta.updatedAt
      };
    } else {
      resumesList.push({
        id: resumeId,
        name: resumeData.name || 'Untitled Resume',
        createdAt: resumeWithMeta.createdAt,
        updatedAt: resumeWithMeta.updatedAt
      });
    }
    
    localStorage.setItem(RESUMES_LIST_KEY, JSON.stringify(resumesList));
    
    return {
      success: true,
      message: 'Resume saved successfully!',
      resumeId: resumeId
    };
  } catch (error) {
    console.error('Save error:', error);
    return {
      success: false,
      message: 'Failed to save resume'
    };
  }
}

// Get all resumes list (metadata only)
export function getResumesList() {
  try {
    const list = localStorage.getItem(RESUMES_LIST_KEY);
    return list ? JSON.parse(list) : [];
  } catch (error) {
    console.error('Get resumes list error:', error);
    return [];
  }
}

// Get full resume by ID
export function getResumeById(resumeId) {
  try {
    const resume = localStorage.getItem(`${RESUME_STORAGE_KEY}_${resumeId}`);
    return resume ? JSON.parse(resume) : null;
  } catch (error) {
    console.error('Get resume error:', error);
    return null;
  }
}

// Delete resume
export function deleteResume(resumeId) {
  try {
    localStorage.removeItem(`${RESUME_STORAGE_KEY}_${resumeId}`);
    
    const resumesList = getResumesList();
    const filteredList = resumesList.filter(r => r.id !== resumeId);
    localStorage.setItem(RESUMES_LIST_KEY, JSON.stringify(filteredList));
    
    return { success: true, message: 'Resume deleted successfully!' };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, message: 'Failed to delete resume' };
  }
}


// Delete all resumes
export function clearAllResumes() {
  try {
    const resumesList = getResumesList();
    let deletedCount = 0;
    
    // Delete each individual resume
    resumesList.forEach(meta => {
      localStorage.removeItem(`${RESUME_STORAGE_KEY}_${meta.id}`);
      deletedCount++;
    });
    
    // Clear the resumes list
    localStorage.removeItem(RESUMES_LIST_KEY);
    
    // Also clear auto-save data if it exists
    localStorage.removeItem('scrb_auto_save_data');
    localStorage.removeItem('scrb_save_queue');
    localStorage.removeItem('scrb_last_save_timestamp');
    
    return { 
      success: true, 
      message: `Successfully cleared ${deletedCount} resumes and auto-save data!`,
      deletedCount 
    };
  } catch (error) {
    console.error('Clear all resumes error:', error);
    return { 
      success: false, 
      message: 'Failed to clear resumes' 
    };
  }
}

// Get storage usage info
export function getStorageInfo() {
  const resumesList = getResumesList();
  let totalSize = 0;
  
  resumesList.forEach(meta => {
    const resume = localStorage.getItem(`${RESUME_STORAGE_KEY}_${meta.id}`);
    if (resume) {
      totalSize += new Blob([resume]).size;
    }
  });
  
  return {
    totalResumes: resumesList.length,
    totalSizeKB: Math.round(totalSize / 1024),
    storageUsed: Math.round((totalSize / (5 * 1024 * 1024)) * 100) // Percentage of 5MB localStorage limit
  };
}
