const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 5000 },
    mood: { type: String, default: null },
    date: { type: String, required: true },
    time: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
