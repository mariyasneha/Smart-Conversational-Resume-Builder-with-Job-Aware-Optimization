#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnvironment() {
  console.log('🚀 Smart Conversational Resume Builder Setup\n');
  
  try {
    // Check if .env already exists
    const envPath = path.join(__dirname, '../backend/.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }

    console.log('📝 Please provide the following configuration:\n');

    // MongoDB URI
    const mongoUri = await question('MongoDB URI (press Enter for default local): ') || 
                     'mongodb://localhost:27017/resumebuilder';

    // OpenAI API Key
    const openaiKey = await question('OpenAI API Key (optional, press Enter to skip): ') || '';

    // Port
    const port = await question('Backend Port (press Enter for 4000): ') || '4000';

    // Frontend URL
    const frontendUrl = await question('Frontend URL (press Enter for http://localhost:3000): ') || 
                        'http://localhost:3000';

    // Create .env content
    const envContent = `# MongoDB Connection
MONGO_URI=${mongoUri}

# OpenAI API Configuration
OPENAI_API_KEY=${openaiKey}

# Server Configuration
PORT=${port}
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=${frontendUrl}
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment configuration saved to backend/.env');

    // Create frontend .env if needed
    const frontendEnvPath = path.join(__dirname, '../frontend/.env');
    const frontendEnvContent = `REACT_APP_API_URL=http://localhost:${port}/api
GENERATE_SOURCEMAP=false
`;
    
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Frontend configuration saved to frontend/.env');

    console.log('\n🎉 Setup complete! You can now run:');
    console.log('   npm run dev     - Start both frontend and backend in development mode');
    console.log('   npm run start   - Start both frontend and backend in production mode');
    
    if (!openaiKey) {
      console.log('\n💡 Note: AI features will use fallback methods without OpenAI API key');
      console.log('   You can add your OpenAI API key to backend/.env later');
    }

    console.log('\n📖 For more information, see README.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupEnvironment();
}

module.exports = { setupEnvironment };
