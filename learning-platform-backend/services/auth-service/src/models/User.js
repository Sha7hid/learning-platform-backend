const mongoose = require('mongoose');

const ALLOWED_ROLES = ['admin', 'institute', 'faculty', 'student'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ALLOWED_ROLES, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);


