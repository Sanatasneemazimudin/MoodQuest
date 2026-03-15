const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Helper: compute level from points
const computeLevel = (pts) => {
  if (pts >= 600) return 'Zen Master';
  if (pts >= 300) return 'Calm Achiever';
  if (pts >= 100) return 'Mind Explorer';
  return 'Beginner';
};

// Helper: update streak
const updateStreak = (user) => {
  const today = new Date().toDateString();
  if (user.lastActiveDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (user.lastActiveDate === yesterday.toDateString()) {
    user.streak += 1;
  } else if (user.lastActiveDate !== null) {
    user.streak = 1;
  }
  user.lastActiveDate = today;
  user.completedToday = [];
};

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.create({
      username: username.trim(),
      password,
      joinDate: new Date().toDateString(),
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        points: user.points,
        level: user.level,
        streak: user.streak,
        achievements: user.achievements,
        completedToday: user.completedToday,
        breathingSessions: user.breathingSessions,
        darkMode: user.darkMode,
        joinDate: user.joinDate,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username?.trim() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Update streak on login
    updateStreak(user);
    user.level = computeLevel(user.points);
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        points: user.points,
        level: user.level,
        streak: user.streak,
        achievements: user.achievements,
        completedToday: user.completedToday,
        breathingSessions: user.breathingSessions,
        darkMode: user.darkMode,
        joinDate: user.joinDate,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
