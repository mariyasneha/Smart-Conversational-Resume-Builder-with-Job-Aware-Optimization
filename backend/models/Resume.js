const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    tenth: {
      type: String,
      required: true,
      validate: {
        validator: (v) => v && v.trim().length > 10 && /\d/.test(v),
        message: "Invalid 10th details",
      },
    },
    twelfth: {
      type: String,
      required: true,
      validate: {
        validator: (v) => v && v.trim().length > 10 && /\d/.test(v),
        message: "Invalid 12th details",
      },
    },
    graduation: {
      type: String,
      required: true,
      validate: {
        validator: (v) => v && v.trim().length > 10 && /\d/.test(v),
        message: "Invalid graduation details",
      },
    },
    postGraduation: {
      type: String,
      default: "NA",
      validate: {
        validator: (v) => v === "NA" || (v && v.trim().length > 10 && /\d/.test(v)),
        message: "Invalid post-graduation details",
      },
    },
  },
  { _id: false } // prevents nested _id for subdocument
);

const resumeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      match: /^[A-Za-z\s]{2,50}$/,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: /^[0-9]{10}$/,
    },
    education: educationSchema,
    technical_skills: {
      type: String,
      required: [true, "Technical skills are required"],
    },
    soft_skills: {
      type: String,
      required: [true, "Soft skills are required"],
    },
    fresher_status: {
      type: String,
      required: [true, "Fresher status is required"],
      enum: ["yes", "no"],
    },
    experience: {
      type: String,
      validate: {
        validator: function(v) {
          // Only required if not a fresher
          return this.fresher_status === "yes" || (v && v.trim().length > 10);
        },
        message: "Experience is required for non-freshers",
      },
    },
    projects: {
      type: String,
      validate: {
        validator: function(v) {
          // Only required if fresher
          return this.fresher_status === "no" || (v && v.trim().length > 10);
        },
        message: "Projects are required for freshers",
      },
    },
    // Keep legacy skills field for backward compatibility
    skills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
