const natural = require("natural");
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();
const { categorizeTechnicalSkills, categorizeJobKeywords } = require("./skillsCategorizer");

/**
 * Extract keywords from job description using TF-IDF
 * @param {string} jobDescription - The job description text
 * @returns {Array} - Array of extracted keywords with scores
 */
function extractKeywords(jobDescription) {
  if (!jobDescription || typeof jobDescription !== 'string') {
    return [];
  }

  const tfidf = new TfIdf();
  tfidf.addDocument(jobDescription.toLowerCase());

  const keywords = [];
  tfidf.listTerms(0).forEach((item) => {
    // Filter out common stop words and short terms
    if (item.term.length > 2 && item.tfidf > 0.5) {
      keywords.push({
        term: item.term,
        score: item.tfidf
      });
    }
  });

  // Return top 20 keywords
  return keywords.slice(0, 20);
}

/**
 * Calculate keyword match score between resume and job description with categorization
 * @param {Object} resumeData - Resume data object
 * @param {Array} jobKeywords - Extracted job keywords
 * @returns {Object} - Match score and categorized suggestions
 */
function calculateMatchScore(resumeData, jobKeywords) {
  if (!resumeData || !jobKeywords || jobKeywords.length === 0) {
    return { 
      score: 0, 
      matchedKeywords: [], 
      missingKeywords: [],
      categorizedAnalysis: null
    };
  }

  // Combine all resume text (fixed to use correct field names)
  const resumeText = [
    resumeData.technical_skills || '',
    resumeData.soft_skills || '',
    resumeData.skills || '', // Legacy support
    resumeData.experience || '',
    resumeData.projects || '',
    resumeData.personal_summary || '',
    resumeData.education_grad || '',
    resumeData.education_pg || '',
    resumeData.education?.graduation || '',
    resumeData.education?.postGraduation || ''
  ].join(' ').toLowerCase();

  const matchedKeywords = [];
  const missingKeywords = [];

  // Debug logging
  console.log('🔍 Debug - Resume text length:', resumeText.length);
  console.log('🔍 Debug - Job keywords count:', jobKeywords.length);
  console.log('🔍 Debug - Resume text preview:', resumeText.substring(0, 200) + '...');

  jobKeywords.forEach(keyword => {
    if (resumeText.includes(keyword.term)) {
      matchedKeywords.push(keyword.term);
      console.log('✅ Matched keyword:', keyword.term);
    } else {
      missingKeywords.push(keyword.term);
      console.log('❌ Missing keyword:', keyword.term);
    }
  });

  const score = Math.round((matchedKeywords.length / jobKeywords.length) * 100);
  console.log('📊 Final match score:', score, '%');

  // Categorize job keywords for better analysis
  const { categorizedKeywords, uncategorizedKeywords } = categorizeJobKeywords(jobKeywords);
  
  // Categorize user's technical skills
  const userSkillsAnalysis = categorizeTechnicalSkills(resumeData.technical_skills || '');
  
  // Create categorized analysis
  const categorizedAnalysis = {
    jobKeywordsByCategory: categorizedKeywords,
    userSkillsByCategory: userSkillsAnalysis.categorized,
    uncategorizedUserSkills: userSkillsAnalysis.uncategorized,
    matchesByCategory: {},
    missingByCategory: {}
  };

  // Calculate matches by category
  Object.entries(categorizedKeywords).forEach(([category, keywords]) => {
    const categoryMatches = [];
    const categoryMissing = [];
    
    keywords.forEach(keyword => {
      const keywordTerm = keyword.term || keyword;
      if (matchedKeywords.includes(keywordTerm)) {
        categoryMatches.push(keywordTerm);
      } else {
        categoryMissing.push(keywordTerm);
      }
    });
    
    if (categoryMatches.length > 0 || categoryMissing.length > 0) {
      categorizedAnalysis.matchesByCategory[category] = categoryMatches;
      categorizedAnalysis.missingByCategory[category] = categoryMissing;
    }
  });

  return {
    score,
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 10), // Top 10 missing keywords
    categorizedAnalysis
  };
}

/**
 * Optimize resume content based on job keywords
 * @param {string} content - Original content
 * @param {Array} keywords - Keywords to incorporate
 * @returns {string} - Optimized content
 */
function optimizeContent(content, keywords) {
  if (!content || !keywords || keywords.length === 0) {
    return content;
  }

  // This is a simple implementation
  // In production, you might want to use GPT API for more sophisticated optimization
  let optimized = content;
  
  // Add suggestion comment
  const keywordList = keywords.slice(0, 5).join(', ');
  const suggestion = `\n\n💡 Suggested keywords to incorporate: ${keywordList}`;
  
  return optimized + suggestion;
}

/**
 * Analyze sentiment of text (useful for experience descriptions)
 * @param {string} text - Text to analyze
 * @returns {Object} - Sentiment analysis result
 */
function analyzeSentiment(text) {
  if (!text) {
    return { score: 0, comparative: 0 };
  }

  const Analyzer = natural.SentimentAnalyzer;
  const stemmer = natural.PorterStemmer;
  const analyzer = new Analyzer("English", stemmer, "afinn");
  
  const tokens = tokenizer.tokenize(text);
  const score = analyzer.getSentiment(tokens);

  return {
    score,
    comparative: score / (tokens.length || 1),
    isPositive: score > 0
  };
}

module.exports = {
  extractKeywords,
  calculateMatchScore,
  optimizeContent,
  analyzeSentiment
};
