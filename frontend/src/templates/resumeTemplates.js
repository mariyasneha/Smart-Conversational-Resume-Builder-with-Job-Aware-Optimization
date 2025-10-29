// Persona-based resume templates for different professional styles

export const RESUME_PERSONAS = {
  PROFESSIONAL: 'professional',
  CREATIVE: 'creative',
  TECHNICAL: 'technical'
};

export const TEMPLATE_METADATA = {
  [RESUME_PERSONAS.PROFESSIONAL]: {
    name: 'Professional',
    description: 'Classic corporate style, ideal for traditional industries',
    icon: '',
    color: '#2c3e50',
    accentColor: '#3498db'
  },
  [RESUME_PERSONAS.CREATIVE]: {
    name: 'Creative',
    description: 'Modern and vibrant, perfect for creative fields',
    icon: '',
    color: '#8e44ad',
    accentColor: '#e74c3c'
  },
  [RESUME_PERSONAS.TECHNICAL]: {
    name: 'Technical',
    description: 'Clean and structured, great for tech roles',
    icon: '',
    color: '#27ae60',
    accentColor: '#16a085'
  }
};

/**
 * Get template styles based on persona
 */
export function getTemplateStyles(persona) {
  const metadata = TEMPLATE_METADATA[persona] || TEMPLATE_METADATA[RESUME_PERSONAS.PROFESSIONAL];
  
  return {
    primaryColor: metadata.color,
    accentColor: metadata.accentColor,
    fontFamily: persona === RESUME_PERSONAS.CREATIVE 
      ? "'Montserrat', sans-serif" 
      : "'Roboto', 'Arial', sans-serif",
    headerSize: 28,
    sectionSpacing: 16
  };
}

/**
 * Format education data for display
 */
export function formatEducation(data) {
  const education = [];
  
  if (data.education_grad) {
    education.push({
      level: 'Graduation',
      details: data.education_grad
    });
  }
  
  if (data.education_pg && data.education_pg !== 'NA') {
    education.push({
      level: 'Post-Graduation',
      details: data.education_pg
    });
  }
  
  if (data.education_12th) {
    education.push({
      level: '12th Standard',
      details: data.education_12th
    });
  }
  
  if (data.education_10th) {
    education.push({
      level: '10th Standard',
      details: data.education_10th
    });
  }
  
  return education;
}

/**
 * Format skills for display
 */
export function formatSkills(skills) {
  if (Array.isArray(skills)) {
    return skills;
  }
  
  if (typeof skills === 'string') {
    return skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  
  return [];
}

/**
 * Generate professional summary based on data
 */
export function generateSummary(data, persona) {
  const skills = formatSkills(data.skills).slice(0, 5).join(', ');
  
  const summaries = {
    [RESUME_PERSONAS.PROFESSIONAL]: 
      `Results-driven professional with expertise in ${skills}. Proven track record in delivering high-quality solutions and driving project success. Committed to continuous learning and professional excellence.`,
    
    [RESUME_PERSONAS.CREATIVE]: 
      `Innovative and creative professional specializing in ${skills}. Passionate about bringing fresh perspectives to challenging projects and creating impactful solutions that make a difference.`,
    
    [RESUME_PERSONAS.TECHNICAL]: 
      `Technical specialist with strong proficiency in ${skills}. Experienced in building scalable, efficient solutions with focus on code quality and best practices. Dedicated to staying current with emerging technologies.`
  };
  
  return summaries[persona] || summaries[RESUME_PERSONAS.PROFESSIONAL];
}

/**
 * Get section order based on persona
 */
export function getSectionOrder(persona) {
  const orders = {
    [RESUME_PERSONAS.PROFESSIONAL]: ['summary', 'experience', 'education', 'skills'],
    [RESUME_PERSONAS.CREATIVE]: ['summary', 'skills', 'experience', 'education'],
    [RESUME_PERSONAS.TECHNICAL]: ['skills', 'experience', 'education', 'summary']
  };
  
  return orders[persona] || orders[RESUME_PERSONAS.PROFESSIONAL];
}

/**
 * ATS-friendly formatting rules
 */
export const ATS_GUIDELINES = {
  // Use standard section headings
  sectionHeadings: {
    experience: 'PROFESSIONAL EXPERIENCE',
    education: 'EDUCATION',
    skills: 'TECHNICAL SKILLS',
    summary: 'PROFESSIONAL SUMMARY'
  },
  
  // Avoid these elements (not ATS-friendly)
  avoid: [
    'Tables',
    'Text boxes',
    'Headers/Footers',
    'Images',
    'Graphics',
    'Special characters'
  ],
  
  // Recommended fonts
  fonts: ['Arial', 'Calibri', 'Helvetica', 'Georgia', 'Times New Roman'],
  
  // File format
  preferredFormat: 'PDF or DOCX',
  
  // Keywords
  keywordTips: [
    'Use exact job title keywords',
    'Include technical skills',
    'Add industry-specific terms',
    'Use action verbs',
    'Quantify achievements'
  ]
};

export default {
  RESUME_PERSONAS,
  TEMPLATE_METADATA,
  getTemplateStyles,
  formatEducation,
  formatSkills,
  generateSummary,
  getSectionOrder,
  ATS_GUIDELINES
};
