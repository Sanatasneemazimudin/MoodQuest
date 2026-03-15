const express = require('express');
const router = express.Router();
const MoodLog = require('../models/MoodLog');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const MOOD_SCORES = { Amazing: 5, Good: 4, Okay: 3, Low: 2, Stressed: 1 };

const computeLevel = (pts) => {
  if (pts >= 600) return 'Zen Master';
  if (pts >= 300) return 'Calm Achiever';
  if (pts >= 100) return 'Mind Explorer';
  return 'Beginner';
};

const checkAchievements = async (user, moodCount) => {
  const add = (a) => { if (!user.achievements.includes(a)) user.achievements.push(a); };
  if (moodCount >= 7) add('Mood Tracker');
  if (user.points >= 100) add('Mind Explorer');
  if (user.points >= 300) add('Calm Achiever');
  if (user.points >= 600) add('Zen Master');
};

// ── POST /api/moods ───────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { emoji, mood } = req.body;
    if (!emoji || !mood) {
      return res.status(400).json({ message: 'Emoji and mood are required' });
    }

    const now = new Date();
    const entry = await MoodLog.create({
      user: req.user._id,
      emoji,
      mood,
      score: MOOD_SCORES[mood] || 3,
      date: now.toDateString(),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });

    // Award 10 points
    const user = await User.findById(req.user._id);
    user.points += 10;
    user.level = computeLevel(user.points);
    const moodCount = await MoodLog.countDocuments({ user: req.user._id });
    await checkAchievements(user, moodCount);
    await user.save();

    res.status(201).json({
      entry,
      points: user.points,
      level: user.level,
      achievements: user.achievements,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/moods ────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const logs = await MoodLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/moods/weekly ─────────────────────────────────────
router.get('/weekly', protect, async (req, res) => {
  try {
    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await MoodLog.find({
      user: req.user._id,
      createdAt: { $gte: sevenDaysAgo },
    });

    // Build day-by-day averages
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayLogs = logs.filter((l) => l.date === dateStr);
      const avg =
        dayLogs.length > 0
          ? dayLogs.reduce((s, l) => s + l.score, 0) / dayLogs.length
          : null;
      result.push({ label, score: avg !== null ? Math.round(avg * 10) / 10 : null });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
