// Legacy API file - redirects to simpleApi for compatibility
export { 
  validateField, 
  autoSave, 
  processSaveQueue, 
  getSaveStatus, 
  loadFromLocalStorage, 
  isOnline, 
  clearAllLocalData,
  saveResumeToMongoDB,
  getAllResumes
} from "./simpleApi";
