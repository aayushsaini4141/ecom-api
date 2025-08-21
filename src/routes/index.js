const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const productRoutes = require('./product');
const categoryRoutes = require('./category');
const cartRoutes = require('./cart');
const orderRoutes = require('./order');
const uploadRoutes = require('./upload');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/', uploadRoutes);

module.exports = router;
