const request = require('supertest');
const express = require('express');
const productRoutes = require('../src/routes/product');

jest.mock('../src/models/Product');
jest.mock('../src/models/Category');

const Product = require('../src/models/Product');
const Category = require('../src/models/Category');

const app = express();
app.use(express.json());
app.use('/products', productRoutes);

describe('Product Listing with Filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list products with minPrice and maxPrice filter', async () => {
    Product.findAndCountAll.mockResolvedValue({
      rows: [
        { id: 1, name: 'Phone', price: 50, categoryId: 2 },
        { id: 2, name: 'Tablet', price: 80, categoryId: 2 }
      ],
      count: 2
    });
    const res = await request(app)
      .get('/products/list?minPrice=40&maxPrice=100')
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(2);
    expect(res.body.total).toBe(2);
  });

  it('should list products by categoryId', async () => {
    Product.findAndCountAll.mockResolvedValue({
      rows: [
        { id: 3, name: 'Shirt', price: 20, categoryId: 1 }
      ],
      count: 1
    });
    const res = await request(app)
      .get('/products/list?categoryId=1')
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body.products[0]).toHaveProperty('categoryId', 1);
  });

  it('should list products by search term', async () => {
    Product.findAndCountAll.mockResolvedValue({
      rows: [
        { id: 4, name: 'Smartphone', price: 99, categoryId: 2 }
      ],
      count: 1
    });
    const res = await request(app)
      .get('/products/list?search=Smart')
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body.products[0].name).toMatch(/Smart/);
  });

  it('should paginate products', async () => {
    Product.findAndCountAll.mockResolvedValue({
      rows: [
        { id: 5, name: 'Item1', price: 10, categoryId: 1 },
        { id: 6, name: 'Item2', price: 15, categoryId: 1 }
      ],
      count: 10
    });
    const res = await request(app)
      .get('/products/list?page=2&limit=2')
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(2);
    expect(res.body.products.length).toBe(2);
  });
});
