const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const MOOD_SCORES = { Amazing: 5, Good: 4, Okay: 3, Low: 2, Stressed: 1 };

const computeLevel = (pts) => {
  if (pts >= 600) return 'Zen Master';
  if (pts >= 300) return 'Calm Achiever';
  if (pts >= 100) return 'Mind Explorer';
  return 'Beginner';
};

const checkAchievements = (user) => {
  const add = (a) => { if (!user.achievements.includes(a)) user.achievements.push(a); };
  if (user.points >= 100) add('Mind Explorer');
  if (user.points >= 300) add('Calm Achiever');
  if (user.points >= 600) add('Zen Master');
  if (user.streak >= 7)   add('Week Warrior');
  if (user.streak >= 30)  add('Monthly Master');
  if (user.breathingSessions >= 1) add('Breathe Easy');
};

// ── GET /api/users/me ─────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// ── PUT /api/users/darkmode ───────────────────────────────────
router.put('/darkmode', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.darkMode = req.body.darkMode;
    await user.save();
    res.json({ darkMode: user.darkMode });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/users/challenge ─────────────────────────────────
router.post('/challenge', protect, async (req, res) => {
  try {
    const { challengeId, points } = req.body;
    const user = await User.findById(req.user._id);

    if (user.completedToday.includes(challengeId)) {
      return res.status(400).json({ message: 'Already completed today' });
    }

    user.completedToday.push(challengeId);
    user.points += points;
    user.level = computeLevel(user.points);
    checkAchievements(user);
    await user.save();

    res.json({
      points: user.points,
      level: user.level,
      achievements: user.achievements,
      completedToday: user.completedToday,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/users/breathing ─────────────────────────────────
router.post('/breathing', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.breathingSessions += 1;
    user.points += 20;
    user.level = computeLevel(user.points);
    checkAchievements(user);
    await user.save();

    res.json({
      points: user.points,
      level: user.level,
      achievements: user.achievements,
      breathingSessions: user.breathingSessions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/users/leaderboard ────────────────────────────────
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const users = await User.find({})
      .select('username points level streak achievements')
      .sort({ points: -1 })
      .limit(15);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
