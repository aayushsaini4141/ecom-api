const express = require('express');
const { body, validationResult, query } = require('express-validator');
const upload = require('../middleware/upload');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();


// Admin: Create product
router.post('/', authenticate, authorize('admin'), upload.single('image'), [
  body('name').notEmpty(),
  body('price').isFloat({ gt: 0 }),
  body('stock').isInt({ min: 0 }),
  body('categoryId').isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    console.log('File received:', req.file);
    let imageUrl = null;
    if (req.file) {
      // Multer-Cloudinary puts the URL in req.file.path, but sometimes in req.file.url
      imageUrl = req.file.path || req.file.url || null;
      if (!imageUrl) {
        console.error('Image upload error: No URL found in req.file', req.file);
        return res.status(500).json({ error: 'Image upload failed', details: req.file });
      }
    }
    const { name, description, price, stock, categoryId } = req.body;
    const product = await Product.create({ name, description, price, stock, categoryId, imageUrl });
    res.json(product);
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Admin: Update product
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  const { name, description, price, stock, categoryId } = req.body;
  if (req.file) {
    const result = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error) return res.status(500).json({ error: 'Image upload failed' });
      product.imageUrl = result.secure_url;
    }).end(req.file.buffer);
  }
  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.stock = stock || product.stock;
  product.categoryId = categoryId || product.categoryId;
  await product.save();
  res.json(product);
});

// Admin: Delete product
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  await product.destroy();
  res.json({ success: true });
});

// Admin: List products
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const products = await Product.findAll({ include: Category });
  res.json(products);
});

// Customer: List products with filters
router.get('/list', [
  query('minPrice').optional().isFloat({ gt: 0 }),
  query('maxPrice').optional().isFloat({ gt: 0 }),
  query('categoryId').optional().isInt(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { minPrice, maxPrice, categoryId, search, page = 1, limit = 10 } = req.query;
  const where = {};
  if (minPrice) where.price = { ...where.price, [Op.gte]: parseFloat(minPrice) };
  if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };
  if (categoryId) where.categoryId = categoryId;
  if (search) where.name = { [Op.iLike]: `%${search}%` };
  const products = await Product.findAndCountAll({
    where,
    include: Category,
    offset: (page - 1) * limit,
    limit: parseInt(limit)
  });
  res.json({
    products: products.rows,
    total: products.count,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

module.exports = router;
