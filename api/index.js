const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const dns = require('dns');

// Fix DNS issues for Vercel
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();
dotenv.config();
console.log('🔍 Current Directory:', __dirname);
console.log('🔍 MONGO_URI value:', process.env.MONGO_URI ? 'Found ✅' : 'NOT FOUND ❌');
connectDB();

const app = express();

// CORS setup - Allow your frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL || true] 
    : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// All routes should start with /api
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/moods', require('./routes/moods'));
app.use('/api/journal', require('./routes/journal'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'MoodQuest API running 🌿' });
});

// Export for Vercel serverless (IMPORTANT!)
module.exports = app;

// Only listen if running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}