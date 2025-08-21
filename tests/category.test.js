const request = require('supertest');
const express = require('express');
const categoryRoutes = require('../src/routes/category');

jest.mock('../src/models/Category');
jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
  authorize: () => (req, res, next) => next()
}));

const Category = require('../src/models/Category');

const app = express();
app.use(express.json());
app.use('/category', categoryRoutes);

describe('Category Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a category', async () => {
    Category.create.mockResolvedValue({ id: 1, name: 'Electronics', description: 'Electronic items' });
    const res = await request(app)
      .post('/category')
      .send({ name: 'Electronics', description: 'Electronic items' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Electronics');
  });

  it('should get all categories', async () => {
    Category.findAll.mockResolvedValue([
      { id: 1, name: 'Electronics', description: 'Electronic items' },
      { id: 2, name: 'Clothing', description: 'Apparel and fashion' }
    ]);
    const res = await request(app)
      .get('/category')
      .send();
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('should update a category', async () => {
    const mockCategory = {
      id: 1,
      name: 'Electronics',
      description: 'Electronic items',
      save: jest.fn().mockResolvedValue({ id: 1, name: 'Updated', description: 'Updated desc' })
    };
    Category.findByPk.mockResolvedValue(mockCategory);
    const res = await request(app)
      .put('/category/1')
      .send({ name: 'Updated', description: 'Updated desc' });
    expect(res.statusCode).toBe(200);
    expect(mockCategory.save).toHaveBeenCalled();
    expect(res.body).toHaveProperty('name', 'Updated');
  });

  it('should return 404 if category not found on update', async () => {
    Category.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .put('/category/999')
      .send({ name: 'Updated' });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not found');
  });

  it('should delete a category', async () => {
    const mockCategory = {
      id: 1,
      destroy: jest.fn().mockResolvedValue(true)
    };
    Category.findByPk.mockResolvedValue(mockCategory);
    const res = await request(app)
      .delete('/category/1')
      .send();
    expect(res.statusCode).toBe(200);
    expect(mockCategory.destroy).toHaveBeenCalled();
    expect(res.body).toHaveProperty('success', true);
  });

  it('should return 404 if category not found on delete', async () => {
    Category.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .delete('/category/999')
      .send();
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not found');
  });
});
