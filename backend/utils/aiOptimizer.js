const OpenAI = require("openai");

// Initialize OpenAI client
let openai = null;

function initializeOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

/**
 * Use GPT to optimize resume content based on job description
 * @param {Object} resumeData - Resume data
 * @param {string} jobDescription - Job description text
 * @returns {Object} - Optimized suggestions
 */
async function optimizeResumeWithAI(resumeData, jobDescription) {
  try {
    const client = initializeOpenAI();
    
    if (!client) {
      return {
        success: false,
        message: "OpenAI API key not configured"
      };
    }

    const prompt = `You are an expert resume optimizer and ATS specialist. 

Job Description:
${jobDescription}

Current Resume Data:
- Skills: ${resumeData.skills}
- Experience: ${resumeData.experience}

Task: Analyze the job description and provide:
1. Top 10 keywords the resume should include
2. Suggested improvements to the experience section (2-3 sentences)
3. Additional skills to highlight
4. ATS optimization score (0-100)

Respond in JSON format:
{
  "keywords": ["keyword1", "keyword2", ...],
  "experienceSuggestion": "improved experience text",
  "suggestedSkills": ["skill1", "skill2", ...],
  "atsScore": 85,
  "recommendations": ["tip1", "tip2", ...]
}`;

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert ATS resume optimizer. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error("AI Optimization Error:", error.message);
    return {
      success: false,
      message: "AI optimization failed. Using fallback NLP analysis.",
      error: error.message
    };
  }
}

/**
 * Generate personalized resume summary using AI
 * @param {Object} resumeData - Resume data
 * @param {string} persona - Resume persona (professional, creative, technical)
 * @returns {string} - Generated summary
 */
async function generateResumeSummary(resumeData, persona = "professional") {
  try {
    const client = initializeOpenAI();
    
    if (!client) {
      return generateFallbackSummary(resumeData, persona);
    }

    const toneGuides = {
      professional: "formal, achievement-focused, corporate tone",
      creative: "engaging, innovative, showcasing creativity",
      technical: "technical depth, specific technologies, problem-solving focus"
    };

    const prompt = `Create a compelling 2-3 sentence professional summary for a resume with this data:
- Name: ${resumeData.name}
- Skills: ${resumeData.skills}
- Experience: ${resumeData.experience}
- Education: ${resumeData.education?.graduation || 'Not specified'}

Style: ${personaInstructions[persona] || personaInstructions.professional}

Write only the summary, no additional text.`;

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer. Create compelling, ATS-friendly professional summaries."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();

  } catch (error) {
    console.error("Summary Generation Error:", error.message);
    return generateFallbackSummary(resumeData, persona);
  }
}

/**
 * Fallback summary generator when AI is not available
 */
function generateFallbackSummary(resumeData, persona) {
  const skills = Array.isArray(resumeData.skills) 
    ? resumeData.skills.join(', ') 
    : resumeData.skills;

  const templates = {
    professional: `Results-driven professional with expertise in ${skills}. ${resumeData.experience}. Committed to delivering high-quality solutions and continuous learning.`,
    creative: `Innovative and creative professional specializing in ${skills}. ${resumeData.experience}. Passionate about bringing fresh ideas to challenging projects.`,
    technical: `Technical specialist with strong proficiency in ${skills}. ${resumeData.experience}. Focused on building scalable and efficient solutions.`
  };

  return templates[persona] || templates.professional;
}

module.exports = {
  optimizeResumeWithAI,
  generateResumeSummary,
  initializeOpenAI
};
