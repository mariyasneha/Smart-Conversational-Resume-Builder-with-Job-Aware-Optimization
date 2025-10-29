const express = require("express");
const router = express.Router();
const { saveResume, getResumes, validateField } = require("../controllers/resumeController");

router.post("/save", saveResume);
router.get("/all", getResumes);
router.post("/validate", validateField);


module.exports = router;
