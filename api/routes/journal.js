const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const computeLevel = (pts) => {
  if (pts >= 600) return 'Zen Master';
  if (pts >= 300) return 'Calm Achiever';
  if (pts >= 100) return 'Mind Explorer';
  return 'Beginner';
};

const checkAchievements = async (user, journalCount) => {
  const add = (a) => { if (!user.achievements.includes(a)) user.achievements.push(a); };
  if (journalCount >= 5) add('Dear Diary');
  if (user.points >= 100) add('Mind Explorer');
  if (user.points >= 300) add('Calm Achiever');
  if (user.points >= 600) add('Zen Master');
};

// ── POST /api/journal ─────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { text, mood } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: 'Journal text is required' });
    }

    const now = new Date();
    const entry = await JournalEntry.create({
      user: req.user._id,
      text: text.trim(),
      mood: mood || null,
      date: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });

    // Award 15 points
    const user = await User.findById(req.user._id);
    user.points += 15;
    user.level = computeLevel(user.points);
    const journalCount = await JournalEntry.countDocuments({ user: req.user._id });
    await checkAchievements(user, journalCount);
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

// ── GET /api/journal ──────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE /api/journal/:id ───────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await entry.deleteOne();
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
