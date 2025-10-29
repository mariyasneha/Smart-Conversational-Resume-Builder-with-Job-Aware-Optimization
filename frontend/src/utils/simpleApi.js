// Simplified API without MongoDB dependency
import { saveResume } from './simpleStorage';

// Simple validation (can work offline)
export async function validateField(field, value) {
  // For now, just return success since we have client-side validation
  return { success: true, message: "Valid input." };
}

// Auto-save functionality with localStorage
const AUTO_SAVE_KEY = 'scrb_auto_save_data';
const SAVE_QUEUE_KEY = 'scrb_save_queue';
const LAST_SAVE_KEY = 'scrb_last_save_timestamp';

// Check if online
export function isOnline() {
  return navigator.onLine;
}

// Save data locally with timestamp
export function saveToLocalStorage(data) {
  try {
    const saveData = {
      ...data,
      timestamp: Date.now(),
      lastModified: new Date().toISOString()
    };
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
    localStorage.setItem(LAST_SAVE_KEY, Date.now().toString());
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

// Load data from localStorage
export function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem(AUTO_SAVE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return null;
  }
}

// Auto-save with localStorage priority (no database needed)
export async function autoSave(data, options = {}) {
  const { 
    forceLocal = false, 
    skipQueue = false,
    showNotification = true 
  } = options;

  // Always save locally as backup
  const localSaved = saveToLocalStorage(data);
  
  if (!localSaved) {
    console.warn('Failed to save to localStorage');
  }

  // Save to enhanced localStorage (no database needed)
  try {
    const result = saveResume(data);
    
    if (result.success) {
      return {
        success: true,
        message: 'Resume saved successfully!',
        savedLocally: localSaved,
        savedToStorage: true,
        resumeId: result.resumeId
      };
    } else {
      return {
        success: localSaved,
        message: localSaved ? 'Saved to backup storage only' : 'Save failed',
        savedLocally: localSaved,
        savedToStorage: false,
        error: result.message
      };
    }
  } catch (err) {
    console.error('Auto-save error:', err);
    return {
      success: localSaved,
      message: localSaved ? 'Saved to backup storage only' : 'Save failed',
      savedLocally: localSaved,
      savedToStorage: false,
      error: err.message
    };
  }
}

// Get save status info
export function getSaveStatus() {
  const lastSave = localStorage.getItem(LAST_SAVE_KEY);
  const localData = loadFromLocalStorage();
  
  return {
    lastSaveTime: lastSave ? new Date(parseInt(lastSave)) : null,
    queuedSaves: 0, // No queue needed without database
    hasLocalData: !!localData,
    isOnline: isOnline(),
    localDataTimestamp: localData?.timestamp || null
  };
}

// Clear localStorage data (for testing/debugging)
export function clearAllLocalData() {
  try {
    localStorage.removeItem(AUTO_SAVE_KEY);
    localStorage.removeItem(SAVE_QUEUE_KEY);
    localStorage.removeItem(LAST_SAVE_KEY);
    localStorage.removeItem('scrb_chat_draft_v1');
    localStorage.removeItem('scrb_chat_draft_v1_msgs');
    localStorage.removeItem('scrb_chat_draft_v1_idx');
    return true;
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
    return false;
  }
}

// Dummy functions for compatibility (no longer needed)
export async function processSaveQueue() {
  return { success: true, processed: 0 };
}

export async function saveResumeToMongoDB(data) {
  // Redirect to simple storage
  return saveResume(data);
}

export async function getAllResumes() {
  // This would be handled by SimpleStorageViewer component
  return { success: false, message: "Use local storage viewer instead" };
}
