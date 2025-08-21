const express = require('express');
const Category = require('../models/Category');
const { authenticateJwt, requireRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json({ categories });
});

router.post('/', authenticateJwt, requireRoles('admin'), async (req, res) => {
  const { name, description } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ message: 'Validation error', errors: [{ field: 'name', message: 'Name must be at least 2 characters' }] });
  }
  const existing = await Category.findOne({ name });
  if (existing) return res.status(409).json({ message: 'Category already exists' });
  const category = await Category.create({ name, description });
  res.status(201).json({ category });
});

router.put('/:id', authenticateJwt, requireRoles('admin'), async (req, res) => {
  const { name } = req.body || {};
  if (name && (typeof name !== 'string' || name.trim().length < 2)) {
    return res.status(400).json({ message: 'Validation error', errors: [{ field: 'name', message: 'Name must be at least 2 characters' }] });
  }
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return res.status(404).json({ message: 'Not found' });
  res.json({ category });
});

router.delete('/:id', authenticateJwt, requireRoles('admin'), async (req, res) => {
  const deleted = await Category.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;


