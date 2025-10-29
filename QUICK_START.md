# 🚀 Quick Start Guide

Get the Smart Conversational Resume Builder running in 5 minutes!

## Prerequisites
- Node.js (v16+) - [Download here](https://nodejs.org/)
- OpenAI API key (optional) - For AI-powered features

## 1. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-conversational-resume-builder.git
cd smart-conversational-resume-builder

# Install dependencies for both frontend and backend
npm run install-all
```

## 2. Environment Configuration

### Option A: Automatic Setup (Recommended)
```bash
npm run setup
```
Follow the prompts to configure your environment.

### Option B: Manual Setup
Create `backend/.env`:
```env
OPENAI_API_KEY=your_openai_key_here
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 3. Start the Application

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Backend API: http://localhost:4000
- Frontend App: http://localhost:3000

## 4. First Use

1. Open http://localhost:3000 in your browser
2. Start the chat interface
3. Fill in your resume details
4. Try the voice input feature (🎙️ button)
5. Select a template style
6. Export your resume as PDF

## 🎯 Key Features to Try

### Voice Input
- Click the 🎙️ microphone button
- Speak your response clearly
- Works best in Chrome/Edge browsers

### Job Optimization
1. Complete your resume
2. Click "🎯 Optimize for Job"
3. Paste a job description
4. Get AI-powered keyword suggestions

### Template Styles
- **Professional**: Corporate and traditional
- **Creative**: Modern and vibrant  
- **Technical**: Clean and structured

### PDF Export
- Click "📥 Download ATS-Friendly PDF"
- Get a professionally formatted resume
- Optimized for Applicant Tracking Systems

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change port in backend/.env
PORT=4001
```

**Backend connection issues:**
- Check if backend server is running on port 4000
- Verify environment variables are set correctly

**Voice input not working:**
- Use Chrome or Edge browser
- Allow microphone permissions
- Ensure HTTPS in production

**AI features not working:**
- Add OpenAI API key to backend/.env
- Features will use fallback methods without API key

### Development Commands

```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev

# Start production servers  
npm run start

# Build frontend for production
npm run build

# Run tests
npm test
```

## 📱 Browser Support

- ✅ Chrome (recommended for voice input)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Voice input requires modern browser

## 🆘 Need Help?

1. Check the [full README](README.md)
2. Review [troubleshooting section](README.md#troubleshooting)
3. Create an [issue on GitHub](https://github.com/yourusername/smart-conversational-resume-builder/issues)

## 🎉 You're Ready!

Your Smart Conversational Resume Builder is now running. Start creating professional, ATS-friendly resumes with AI-powered optimization!

---

**Next Steps:**
- Customize templates in `frontend/src/templates/`
- Add more AI features in `backend/utils/aiOptimizer.js`
- Deploy to production using the deployment guide in README.md
