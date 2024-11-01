const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../app');
const { User } = require('../models/user');

// // Setup test environment variables
// process.env.JWT_SECRET = 'test_secret_key';
// process.env.NODE_ENV = 'test';

describe('User API', () => {
  let testUser;
  let adminUser;
  let userToken;
  let adminToken;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/blog-api-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  });

  beforeEach(async () => {
    // Clear database
    await User.deleteMany({});

    // Create test users
    testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      displayName: 'TestUser01',
      role: 'user'
    });

    adminUser = new User({
      email: 'admin@example.com',
      password: 'admin123',
      displayName: 'AdminUser01',
      role: 'admin'
    });

    await testUser.save();
    await adminUser.save();

    userToken = await testUser.generateAuthToken();
    adminToken = await adminUser.generateAuthToken();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'newpass123',
        displayName: 'NewUser123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(200);

      expect(response.headers['x-auth']).toBeTruthy();
      expect(response.body.email).toBe(userData.email);
      expect(response.body.displayName).toBe(userData.displayName);
      expect(response.body.password).toBeUndefined();

      // Verify user was saved to database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.displayName).toBe(userData.displayName);
    });

    it('should not create user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        displayName: 'NewUser123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeTruthy();
    });

    it('should not create user with duplicate email', async () => {
      const userData = {
        email: testUser.email,
        password: 'password123',
        displayName: 'UniqueUser1'
      };

      // await request(app)
      //   .post('/api/users')
      //   .send(userData)
      //   .expect(200);

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBeTruthy();
    });

    it('should not create user with duplicate displayName', async () => {
      const userData = {
        email: 'unique@example.com',
        password: 'password123',
        displayName: testUser.displayName
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('POST /api/users/login', () => {
    it('should login user and return auth token', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'password123'
        })
        .expect(200);

      expect(response.headers['x-auth']).toBeTruthy();
      expect(response.body.email).toBe(testUser.email);
    });

    it('should reject invalid password', async () => {
      await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);
    });
  });

  describe('DELETE /api/users/me/token', () => {
    it('should remove auth token on logout', async () => {
      await request(app)
        .delete('/api/users/me/token')
        .set('x-auth', userToken)
        .expect(200);

      const user = await User.findById(testUser._id);
      expect(user.tokens.length).toBe(0);
    });

    it('should reject unauthorized logout', async () => {
      await request(app)
        .delete('/api/users/me/token')
        .expect(401);
    });
  });
});
