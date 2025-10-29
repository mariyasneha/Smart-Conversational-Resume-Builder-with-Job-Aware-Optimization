const natural = require("natural");

// Simple sanity checks
const validators = {
  name: (value) => /^[A-Za-z\s]{2,50}$/.test(value),
  email: (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(value),
  phone: (value) => /^[0-9]{10}$/.test(value),

  education: (value) => value && value.trim().length > 10 && /\d/.test(value),
  skills: (value) => Array.isArray(value) && value.length > 0,
  experience: (value) => value && value.trim().length > 10 && /[A-Za-z]/.test(value),
};

// NLP-based enhancement: detect gibberish
function isGibberish(value) {
  if (!value) return true;

  // 1️⃣ Static dictionary check
  const dictionary = [
    "developer","engineer","computer","science","resume","project",
    "skills","experience","software","internship","btech","mtech",
    "school","college","university","board","cgpa","percentage"
  ];
  const words = value.toLowerCase().split(/\s+/);
  const realWordsStatic = words.filter((w) => dictionary.includes(w));
  
  // 2️⃣ NLP spellchecker 
  // Tokenize words
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(value);

  const spellcheck = new natural.Spellcheck(dictionary);
  const realWordsNLP = tokens.filter((w) => spellcheck.isCorrect(w.toLowerCase()));

  // Both layers must fail → gibberish
  return (
    realWordsStatic.length < words.length / 3 &&
    realWordsNLP.length < tokens.length / 2
  );
}

module.exports = { validators, isGibberish };
