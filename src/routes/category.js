const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.post('/', authenticate, authorize('admin'), [
  body('name').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.json(category);
});

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: 'Not found' });
  category.name = name || category.name;
  category.description = description || category.description;
  await category.save();
  res.json(category);
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: 'Not found' });
  await category.destroy();
  res.json({ success: true });
});

module.exports = router;
