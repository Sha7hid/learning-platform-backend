const express = require('express');
const Course = require('../models/Course');
const Category = require('../models/Category');
const { authenticateJwt, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Public/role-based course listing
router.get('/', authenticateJwt, async (req, res) => {
  const user = req.user;
  let filter = {};
  if (user.role === 'faculty') {
    filter = { facultyIds: { $in: [String(user.id)] } };
  } else if (user.role === 'student') {
    filter = { isPublished: true };
  }
  const courses = await Course.find(filter).populate('category', 'name');
  res.json({ courses });
});

// Create course (admin or institute)
router.post('/', authenticateJwt, requireRoles('admin', 'institute'), async (req, res) => {
  const { title, description, categoryId, isPublished } = req.body || {};
  const errors = [];
  if (!title || typeof title !== 'string' || title.trim().length < 3) errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
  if (!categoryId || typeof categoryId !== 'string') errors.push({ field: 'categoryId', message: 'categoryId is required' });
  if (description && typeof description !== 'string') errors.push({ field: 'description', message: 'description must be a string' });
  if (errors.length) return res.status(400).json({ message: 'Validation error', errors });
  const cat = await Category.findById(categoryId);
  if (!cat) return res.status(400).json({ message: 'Invalid category' });
  const course = await Course.create({
    title,
    description,
    category: categoryId,
    createdByInstituteId: req.user.role === 'institute' ? String(req.user.id) : 'admin',
    isPublished: Boolean(isPublished),
  });
  res.status(201).json({ course });
});

// Assign faculty (institute only)
router.post('/:id/assign-faculty', authenticateJwt, requireRoles('admin','institute'), async (req, res) => {
  const { facultyIds } = req.body || {};
  if (!Array.isArray(facultyIds) || facultyIds.length < 1) {
    return res.status(400).json({ message: 'Validation error', errors: [{ field: 'facultyIds', message: 'facultyIds must be a non-empty array' }] });
  }
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Not found' });
  course.facultyIds = Array.from(new Set([...(course.facultyIds || []), ...facultyIds.map(String)]));
  await course.save();
  res.json({ course });
});

// Update course (admin or institute who created it)
router.put('/:id', authenticateJwt, requireRoles('admin', 'institute'), async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Not found' });
  if (
    req.user.role === 'institute' &&
    String(course.createdByInstituteId) !== String(req.user.id)
  ) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const updatable = ['title', 'description', 'isPublished'];
  for (const key of updatable) if (key in req.body) course[key] = req.body[key];
  await course.save();
  res.json({ course });
});

// Delete course (admin only)
router.delete('/:id', authenticateJwt, requireRoles('admin'), async (req, res) => {
  const deleted = await Course.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

// Enroll in a course (student only)
router.post('/:id/enroll', authenticateJwt, requireRoles('student'), async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Not found' });
  if (!course.isPublished) return res.status(400).json({ message: 'Course is not open for enrollment' });
  const studentId = String(req.user.id);
  course.enrolledStudentIds = Array.from(new Set([...(course.enrolledStudentIds || []), studentId]));
  await course.save();
  res.status(200).json({ message: 'Enrolled', courseId: course._id, studentId });
});

module.exports = router;


