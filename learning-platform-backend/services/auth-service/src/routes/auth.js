const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateJwt } = require('../middleware/auth');

const router = express.Router();

const ROLES = ['admin', 'institute', 'faculty', 'student'];

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body || {};
  const errors = [];
  if (!name || typeof name !== 'string' || name.trim().length < 2) errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) errors.push({ field: 'email', message: 'Email is invalid' });
  if (!password || typeof password !== 'string' || password.length < 6) errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  if (!ROLES.includes(role)) errors.push({ field: 'role', message: 'Invalid role' });
  if (errors.length) return res.status(400).json({ message: 'Validation error', errors });

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });
  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET || 'changeme', {
    subject: String(user._id),
    expiresIn: '7d',
  });
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) errors.push({ field: 'email', message: 'Email is invalid' });
  if (!password || typeof password !== 'string') errors.push({ field: 'password', message: 'Password is required' });
  if (errors.length) return res.status(400).json({ message: 'Validation error', errors });

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET || 'changeme', {
    subject: String(user._id),
    expiresIn: '7d',
  });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.get('/me', authenticateJwt, async (req, res) => {
  const user = await User.findById(req.user.id).select('name email role');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;


