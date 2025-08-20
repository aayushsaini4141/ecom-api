const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const router = express.Router();

// Add product to cart
router.post('/add', authenticate, authorize('customer'), [
  body('productId').isInt(),
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { productId, quantity } = req.body;
  const product = await Product.findByPk(productId);
  if (!product || product.stock < quantity) return res.status(400).json({ error: 'Product unavailable' });
  let cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (!cart) cart = await Cart.create({ userId: req.user.id });
  const priceAtAdd = product.price;
  const item = await CartItem.create({ cartId: cart.id, productId, quantity, priceAtAdd });
  res.json(item);
});

// View cart
router.get('/', authenticate, authorize('customer'), async (req, res) => {
  let cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (!cart) return res.json({ items: [] });
  const items = await CartItem.findAll({ where: { cartId: cart.id }, include: Product });
  res.json({ items });
});

// Remove item from cart
router.delete('/remove/:itemId', authenticate, authorize('customer'), async (req, res) => {
  const item = await CartItem.findByPk(req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.destroy();
  res.json({ success: true });
});

module.exports = router;
