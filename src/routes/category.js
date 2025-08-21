
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */
const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create category (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category created
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, authorize('admin'), [
  body('name').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.json(category);
});

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List all categories (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update category (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Not found
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: 'Not found' });
  category.name = name || category.name;
  category.description = description || category.description;
  await category.save();
  res.json(category);
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: 'Not found' });
  await category.destroy();
  res.json({ success: true });
});

module.exports = router;
