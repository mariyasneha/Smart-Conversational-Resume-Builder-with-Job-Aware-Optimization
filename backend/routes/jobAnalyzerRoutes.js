const express = require("express");
const router = express.Router();
const {
  analyzeJobDescription,
  optimizeResume,
  getKeywordSuggestions
} = require("../controllers/jobAnalyzerController");

// Analyze job description and extract keywords
router.post("/analyze", analyzeJobDescription);

// Optimize resume based on job description
router.post("/optimize", optimizeResume);

// Get keyword suggestions for specific fields
router.post("/suggestions", getKeywordSuggestions);

module.exports = router;
