const request = require('supertest');
const express = require('express');
const cartRoutes = require('../src/routes/cart');
const orderRoutes = require('../src/routes/order');

jest.mock('../src/models/Cart');
jest.mock('../src/models/CartItem');
jest.mock('../src/models/Product');
jest.mock('../src/models/Order');
jest.mock('../src/models/OrderItem');
jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = req.headers['x-admin'] ? { id: 1, role: 'admin' } : { id: 2, role: 'customer' };
    next();
  },
  authorize: (role) => (req, res, next) => next()
}));

const Cart = require('../src/models/Cart');
const CartItem = require('../src/models/CartItem');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const OrderItem = require('../src/models/OrderItem');

const app = express();
app.use(express.json());
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

describe('Shopping Cart & Order Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add product to cart', async () => {
    Product.findByPk.mockResolvedValue({ id: 1, stock: 10, price: 100 });
    Cart.findOne.mockResolvedValue(null);
    Cart.create.mockResolvedValue({ id: 1, userId: 2 });
    CartItem.create.mockResolvedValue({ id: 1, cartId: 1, productId: 1, quantity: 2, priceAtAdd: 100 });
    const res = await request(app)
      .post('/cart/add')
      .send({ productId: 1, quantity: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('productId', 1);
    expect(res.body).toHaveProperty('quantity', 2);
  });

  it('should view cart', async () => {
    Cart.findOne.mockResolvedValue({ id: 1, userId: 2 });
    CartItem.findAll.mockResolvedValue([
      { id: 1, cartId: 1, productId: 1, quantity: 2, Product: { name: 'Phone' } }
    ]);
    const res = await request(app)
      .get('/cart')
      .send();
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items[0]).toHaveProperty('Product');
  });

  it('should remove item from cart', async () => {
    CartItem.findByPk.mockResolvedValue({ id: 1, destroy: jest.fn().mockResolvedValue(true) });
    const res = await request(app)
      .delete('/cart/remove/1')
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should place order', async () => {
    Cart.findOne.mockResolvedValue({ id: 1, userId: 2 });
    CartItem.findAll.mockResolvedValue([
      { id: 1, cartId: 1, productId: 1, quantity: 2, priceAtAdd: 100, destroy: jest.fn().mockResolvedValue(true) }
    ]);
    Order.create.mockResolvedValue({ id: 1, userId: 2 });
    OrderItem.create.mockResolvedValue({});
    Product.findByPk.mockResolvedValue({ id: 1, stock: 10, save: jest.fn().mockResolvedValue(true) });
    const res = await request(app)
      .post('/orders')
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('orderId', 1);
  });

  it('should view order history', async () => {
    Order.findAll.mockResolvedValue([
      { id: 1, userId: 2, OrderItems: [{ id: 1, productId: 1 }] }
    ]);
    const res = await request(app)
      .get('/orders')
      .send();
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('admin should view all orders', async () => {
    Order.findAll.mockResolvedValue([
      { id: 1, userId: 2, OrderItems: [{ id: 1, productId: 1 }] }
    ]);
    const res = await request(app)
      .get('/orders/all')
      .set('x-admin', 'true')
      .send();
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
