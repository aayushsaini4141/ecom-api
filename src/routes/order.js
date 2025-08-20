const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const router = express.Router();

// Place order
router.post('/', authenticate, authorize('customer'), async (req, res) => {
  let cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (!cart) return res.status(400).json({ error: 'Cart empty' });
  const items = await CartItem.findAll({ where: { cartId: cart.id } });
  if (!items.length) return res.status(400).json({ error: 'Cart empty' });
  const order = await Order.create({ userId: req.user.id });
  for (const item of items) {
    await OrderItem.create({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      priceAtOrder: item.priceAtAdd // persistent pricing
    });
    // Reduce product stock
    const product = await Product.findByPk(item.productId);
    product.stock -= item.quantity;
    await product.save();
    await item.destroy();
  }
  res.json({ orderId: order.id });
});

// View order history
router.get('/', authenticate, authorize('customer'), async (req, res) => {
  const orders = await Order.findAll({ where: { userId: req.user.id }, include: OrderItem });
  res.json(orders);
});

// Admin: View all orders
router.get('/all', authenticate, authorize('admin'), async (req, res) => {
  const orders = await Order.findAll({ include: OrderItem });
  res.json(orders);
});

module.exports = router;
