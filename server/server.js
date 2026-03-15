const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/users',   require('./routes/users'));
app.use('/api/moods',   require('./routes/moods'));
app.use('/api/journal', require('./routes/journal'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'MoodQuest API running 🌿', ts: new Date().toISOString() })
);

// ── Serve React build in production ───────────────────────────
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(buildPath));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(buildPath, 'index.html'))
  );
}

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Server error:', err.message);
  res.status(err.statusCode || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 MoodQuest server on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
);
