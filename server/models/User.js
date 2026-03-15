const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Username must be at least 2 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    points: { type: Number, default: 0 },
    level: { type: String, default: 'Beginner' },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null },
    achievements: { type: [String], default: ['Beginner'] },
    completedToday: { type: [String], default: [] },
    breathingSessions: { type: Number, default: 0 },
    darkMode: { type: Boolean, default: false },
    joinDate: { type: String, default: () => new Date().toDateString() },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
