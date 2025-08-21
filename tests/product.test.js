const multer = require('multer');
const request = require('supertest');
const express = require('express');
const productRoutes = require('../src/routes/product');

// Mock multer and Cloudinary before any imports
jest.mock('multer', () => {
  const m = {
    single: () => (req, res, next) => {
      req.file = {
        buffer: Buffer.from('fakeimg'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        path: 'img.jpg' // Add path property that your route expects
      };
      next();
    }
  };
  return () => m;
});

jest.mock('multer-storage-cloudinary', () => ({
  CloudinaryStorage: jest.fn(() => ({
    _handleFile: (req, file, cb) => cb(null, { path: 'img.jpg' }),
    _removeFile: (req, file, cb) => cb(null)
  }))
}));

jest.mock('../src/config/cloudinary', () => ({
  uploader: {
    upload_stream: jest.fn((opts, cb) => {
      // Simulate async upload with immediate callback
      process.nextTick(() => cb(null, { secure_url: 'img.jpg' }));
      return { end: jest.fn() };
    })
  }
}));

jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
  authorize: () => (req, res, next) => next()
}));

jest.mock('../src/models/Product');
jest.mock('../src/models/Category', () => ({
  findAll: jest.fn()
}));

describe('Product Management', () => {

  let Product, Category, app;

  beforeAll(() => {
    Product = require('../src/models/Product');
    Category = require('../src/models/Category');
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/product', productRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Product.create = jest.fn();
    Product.findByPk = jest.fn();
    Category.findAll = jest.fn();
  });

  it('should create a product with image', async () => {
    Product.create.mockResolvedValue({
      id: 1,
      name: 'Test',
      price: 10,
      stock: 5,
      categoryId: 1,
      imageUrl: 'img.jpg'
    });
    const res = await request(app)
      .post('/product')
      .send({
        name: 'Test',
        price: 10,
        stock: 5,
        categoryId: 1
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test');
    expect(res.body).toHaveProperty('imageUrl');
  }, 10000); // Increase timeout to 10s

  it('should update a product and image', async () => {
    const mockProduct = {
      id: 1,
      name: 'Test',
      save: jest.fn().mockImplementation(function() { this.name = 'Updated'; return Promise.resolve(this); }),
      imageUrl: '',
      price: 10,
      stock: 5,
      categoryId: 1
    };
    Product.findByPk.mockResolvedValueOnce(mockProduct);
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/product', productRoutes);
    const res = await request(app)
      .put('/product/1')
      .send({
        name: 'Updated',
        price: 10,
        stock: 5,
        categoryId: 1
      });
    console.log('Update product response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(Product.findByPk).toHaveBeenCalledWith('1');
    expect(mockProduct.save).toHaveBeenCalled();
    expect(res.body).toHaveProperty('name', 'Updated');
  });

  it('should return 404 if product not found on update', async () => {
    // Mock the Product.findByPk method to return null
    Product.findByPk.mockResolvedValue(null);
    
    // Mock Category.findAll if needed by the route
    Category.findAll.mockResolvedValue([]);

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true })); // Add this to handle form data
    app.use('/product', productRoutes);
    
    const res = await request(app)
      .put('/product/999')
      .field('name', 'Updated')
      .field('description', 'Test description')
      .field('price', '10.99')
      .field('stock', '5')
      .field('categoryId', '1')
      .attach('image', Buffer.from('fakeimg'), 'test.jpg');
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not found');
  });
});