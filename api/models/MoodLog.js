const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
    mood: {
      type: String,
      required: true,
      enum: ['Amazing', 'Good', 'Okay', 'Low', 'Stressed'],
    },
    date: { type: String, required: true },   // toDateString() for grouping
    time: { type: String, required: true },
    score: { type: Number, required: true },   // 1-5 numeric for chart
  },
  { timestamps: true }
);

module.exports = mongoose.model('MoodLog', moodLogSchema);
