const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Invoice.deleteMany({});
});

describe('Digital Invoice Generator API Tests', () => {
  describe('Auth API (/api/users)', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          companyName: 'Test Corp',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('token');
      expect(res.body.name).toBe('Test User');
    });

    it('should login an existing user', async () => {
      // Create user first
      const userRes = await request(app).post('/api/users').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
      });

      // Login
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token; // Save token for future tests
      userId = res.body._id;
    });
  });

  describe('Invoice API (/api/invoices)', () => {
    it('should create a new invoice (protected)', async () => {
      // Need a token first
      const userRes = await request(app).post('/api/users').send({
        name: 'Invoice User',
        email: 'invoice@example.com',
        password: 'password123',
      });
      const authToken = userRes.body.token;

      const res = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invoiceNumber: 'INV-001',
          currencyCode: 'USD',
          status: 'pending',
          dueDate: new Date().toISOString(),
          subtotal: 100,
          total: 100,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.invoiceNumber).toBe('INV-001');
    });

    it('should prevent unauthorized access to invoices', async () => {
      const res = await request(app).get('/api/invoices');
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized, no token');
    });
  });
});
