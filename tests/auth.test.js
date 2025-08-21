const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');
const User = require('../src/models/User');

jest.mock('../src/models/User');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('User Authentication', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and return user info', async () => {
      User.create.mockResolvedValue({ id: 1, email: 'test@example.com', role: 'customer' });
      const res = await request(app)
        .post('/auth/signup')
        .send({ email: 'test@example.com', password: 'password123', role: 'customer' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).toHaveProperty('role', 'customer');
    });

    it('should return 400 if email already exists', async () => {
      User.create.mockRejectedValue(new Error('Email already exists'));
      const res = await request(app)
        .post('/auth/signup')
        .send({ email: 'test@example.com', password: 'password123', role: 'customer' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('should return a token for valid credentials', async () => {
      process.env.JWT_SECRET = 'testsecret';
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      User.findOne.mockResolvedValue({ id: 1, email: 'test@example.com', password: 'hashed', role: 'customer' });
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'wrong@example.com', password: 'password123' });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
