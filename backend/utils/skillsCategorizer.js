// Technical Skills Categorizer - Backend version
const technicalSkillsCategories = {
  "Programming Languages": [
    "javascript", "python", "java", "c++", "c", "c#", "php", "ruby", "go", "rust", 
    "swift", "kotlin", "typescript", "scala", "perl", "r", "matlab", "dart", "objective-c"
  ],
  "Web Technology": [
    "react", "reactjs", "angular", "vue", "vuejs", "html", "css", "sass", "scss", "bootstrap", 
    "tailwind", "jquery", "webpack", "vite", "nextjs", "nuxtjs", "svelte", "ember",
    "nodejs", "node.js", "express", "django", "flask", "spring", "laravel", 
    "rails", "asp.net", ".net", "fastapi", "nestjs", "koa", "hapi", "rest api", "graphql"
  ],
  "Mobile Development": [
    "react native", "flutter", "ionic", "xamarin", "android", "ios", 
    "swift", "kotlin", "cordova", "phonegap", "android studio", "xcode"
  ],
  "Tools and Platforms": [
    "git", "github", "gitlab", "bitbucket", "docker", "kubernetes", "jenkins", 
    "aws", "azure", "gcp", "terraform", "ansible", "vagrant", "heroku", "netlify", "vercel",
    "figma", "photoshop", "illustrator", "sketch", "zeplin", "invision", 
    "jira", "trello", "slack", "notion", "confluence", "postman", "insomnia",
    "jest", "mocha", "chai", "cypress", "selenium", "junit", "pytest", 
    "unit testing", "integration testing", "vs code", "visual studio", "intellij"
  ],
  "Database": [
    "mongodb", "mysql", "postgresql", "sqlite", "redis", "cassandra", 
    "dynamodb", "firebase", "oracle", "sql server", "mariadb", "neo4j", "sql"
  ],
  "Operating Systems": [
    "windows", "linux", "ubuntu", "centos", "macos", "unix", "debian", "fedora", 
    "red hat", "android", "ios"
  ]
};

function categorizeTechnicalSkills(skillsString) {
  if (!skillsString || typeof skillsString !== 'string') {
    return { categorized: {}, uncategorized: [] };
  }

  // Split skills by comma and clean them
  const skills = skillsString
    .split(',')
    .map(skill => skill.trim().toLowerCase())
    .filter(skill => skill.length > 0);

  const categorized = {};
  const uncategorized = [];

  skills.forEach(skill => {
    let found = false;
    
    for (const [category, categorySkills] of Object.entries(technicalSkillsCategories)) {
      // More precise matching - exact match or skill contains the category skill
      if (categorySkills.some(catSkill => {
        const normalizedSkill = skill.toLowerCase().replace(/[.\s]/g, '');
        const normalizedCatSkill = catSkill.toLowerCase().replace(/[.\s]/g, '');
        return normalizedSkill === normalizedCatSkill || 
               normalizedSkill.includes(normalizedCatSkill) ||
               normalizedCatSkill.includes(normalizedSkill);
      })) {
        if (!categorized[category]) {
          categorized[category] = [];
        }
        // Keep original case for display
        const originalSkill = skillsString
          .split(',')
          .find(s => s.trim().toLowerCase() === skill)
          ?.trim() || skill;
        categorized[category].push(originalSkill);
        found = true;
        break;
      }
    }
    
    if (!found) {
      const originalSkill = skillsString
        .split(',')
        .find(s => s.trim().toLowerCase() === skill)
        ?.trim() || skill;
      uncategorized.push(originalSkill);
    }
  });

  return { categorized, uncategorized };
}

function formatCategorizedSkills(categorized, uncategorized) {
  let formatted = '';
  
  // Add categorized skills
  Object.entries(categorized).forEach(([category, skills]) => {
    if (skills.length > 0) {
      formatted += `${category}: ${skills.join(', ')}\n`;
    }
  });
  
  // Add uncategorized skills
  if (uncategorized.length > 0) {
    formatted += `Other Skills: ${uncategorized.join(', ')}\n`;
  }
  
  return formatted.trim();
}

// Function to categorize job keywords by skill type
function categorizeJobKeywords(keywords) {
  const categorizedKeywords = {};
  const uncategorizedKeywords = [];

  keywords.forEach(keyword => {
    let found = false;
    const keywordTerm = keyword.term || keyword;
    
    for (const [category, categorySkills] of Object.entries(technicalSkillsCategories)) {
      if (categorySkills.some(catSkill => {
        const normalizedKeyword = keywordTerm.toLowerCase().replace(/[.\s]/g, '');
        const normalizedCatSkill = catSkill.toLowerCase().replace(/[.\s]/g, '');
        return normalizedKeyword === normalizedCatSkill || 
               normalizedKeyword.includes(normalizedCatSkill) ||
               normalizedCatSkill.includes(normalizedKeyword);
      })) {
        if (!categorizedKeywords[category]) {
          categorizedKeywords[category] = [];
        }
        categorizedKeywords[category].push(keyword);
        found = true;
        break;
      }
    }
    
    if (!found) {
      uncategorizedKeywords.push(keyword);
    }
  });

  return { categorizedKeywords, uncategorizedKeywords };
}

module.exports = {
  technicalSkillsCategories,
  categorizeTechnicalSkills,
  formatCategorizedSkills,
  categorizeJobKeywords
};
