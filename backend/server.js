require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const resumeRoutes = require("./routes/resumeRoutes");
const jobAnalyzerRoutes = require("./routes/jobAnalyzerRoutes");
const validationRoutes = require("./routes/validationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/resume", resumeRoutes);
app.use("/api/job", jobAnalyzerRoutes);
app.use("/api/validation", validationRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Smart Conversational Resume Builder API",
    status: "running",
    version: "1.0.0",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await mongoose.connection.close();
  console.log("✅ MongoDB connection closed");
  process.exit(0);
});
