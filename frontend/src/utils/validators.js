// Simple validators
export const validators = {
  name: (value) => /^[A-Za-z\s]{2,50}$/.test(value),
  email: (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(value),
  phone: (value) => /^[0-9]{10}$/.test(value),

  education: (value) => value && value.trim().length > 10 && /\d/.test(value),
  skills: (value) => value.trim().length > 2 && /^[A-Za-z0-9,\s.+#-]+$/.test(value),
  experience: (value) => value && value.trim().length > 10 && /[A-Za-z]/.test(value),
  projects: (value) => value && value.trim().length > 10 && /[A-Za-z]/.test(value),
  certifications: (value) => {
    // Allow "NA" or "None" for no certifications
    if (value.trim().toLowerCase() === 'na' || value.trim().toLowerCase() === 'none') return true;
    // Otherwise, should have certification name and provider
    return value && value.trim().length > 5 && /[A-Za-z]/.test(value);
  },
};

// Simple gibberish check (frontend)
export function isGibberish(value, fieldType = 'general') {
  if (!value) {
    // Allow empty technical skills
    if (fieldType === 'technical_skills') return false;
    return true;
  }

  // For names, be much more lenient - just check for basic patterns
  if (fieldType === 'name') {
    // Names should have at least 2 characters and only letters/spaces
    return value.trim().length < 2 || !/^[A-Za-z\s]+$/.test(value.trim());
  }

  // For emails, skip gibberish check if it passes email validation
  if (fieldType === 'email') {
    // If it looks like a valid email format, don't check for gibberish
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    return !emailRegex.test(value.trim());
  }

  // For phone numbers, skip gibberish check
  if (fieldType === 'phone') {
    return false; // Phone numbers are just digits, no gibberish check needed
  }

  // For education fields, be more lenient - just check basic patterns
  if (fieldType === 'education') {
    // Special case for "NA" - always valid
    if (value.trim().toLowerCase() === 'na') {
      return false;
    }
    // Education should have some numbers (year/percentage) and letters
    const hasNumbers = /\d/.test(value);
    const hasLetters = /[A-Za-z]/.test(value);
    const minLength = value.trim().length >= 10;
    return !(hasNumbers && hasLetters && minLength);
  }

  // For technical skills, allow empty or valid skills
  if (fieldType === 'technical_skills') {
    // If empty, it's valid (already handled above, but being explicit)
    if (!value || value.trim() === '') return false;
    // If has content, check basic patterns
    const hasLetters = /[A-Za-z]/.test(value);
    const minLength = value.trim().length >= 2;
    return !(hasLetters && minLength);
  }

  // For skills fields, be very lenient - just check basic patterns
  if (fieldType === 'skills') {
    // Skills should have letters and be comma-separated or space-separated
    const hasLetters = /[A-Za-z]/.test(value);
    const minLength = value.trim().length >= 2;
    return !(hasLetters && minLength);
  }

  // For experience/projects fields, be lenient - just check basic patterns
  if (fieldType === 'experience' || fieldType === 'projects') {
    // Experience/Projects should have letters and be reasonably long
    const hasLetters = /[A-Za-z]/.test(value);
    const minLength = value.trim().length >= 10;
    return !(hasLetters && minLength);
  }

  // For fresher status, only allow yes/no
  if (fieldType === 'fresher_status') {
    const normalized = value.trim().toLowerCase();
    return !(normalized === 'yes' || normalized === 'no');
  }

  // For other fields, use dictionary-based approach
  const dictionary = [
    "developer","engineer","computer","science","resume","project",
    "skills","experience","software","internship","btech","mtech",
    "school","college","university","board","cgpa","percentage",
    "react","node","javascript","python","java","html","css","mongodb",
    "mysql","git","github","api","frontend","backend","fullstack"
  ];

  // Split into words
  const words = value.toLowerCase().split(/\s+/);

  // Count real words
  let realWords = words.filter((w) => dictionary.includes(w));

  // If fewer than 1/4 words are in dictionary → assume gibberish
  return realWords.length < words.length / 4;
}

