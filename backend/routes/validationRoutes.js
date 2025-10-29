const express = require("express");
const router = express.Router();
const { validators, isGibberish } = require("../utils/validators");

router.post("/validate", (req, res) => {
  const { field, value } = req.body;

  if (!field || !value) {
    return res.status(400).json({ success: false, message: "Field and value are required." });
  }

  // Run validator if exists
  if (validators[field] && !validators[field](value)) {
    return res.json({ success: false, message: `❌ Invalid ${field}.` });
  }

  // Run gibberish check (for free text fields)
  if (["name", "education", "skills", "experience"].includes(field) && isGibberish(value)) {
    return res.json({ success: false, message: `🤔 ${field} looks like gibberish.` });
  }

  return res.json({ success: true, message: `✅ ${field} is valid.` });
});

module.exports = router;
