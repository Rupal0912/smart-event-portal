const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

// Connect to a test database before running tests
beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-event-portal-test';
    await mongoose.connect(mongoUri);
});

// Clean up test data and close connection after tests
afterAll(async () => {
    await User.deleteMany({ email: 'testuser@jest.com' });
    await mongoose.connection.close();
});

describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});

describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
        // Clean up first in case previous test run left data
        await User.deleteMany({ email: 'testuser@jest.com' });

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'testuser@jest.com',
                password: 'password123',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toBe('testuser@jest.com');
    });
});

describe('POST /api/auth/login', () => {
    it('should return 401 for wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@jest.com',
                password: 'wrongpassword',
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
    });
});
