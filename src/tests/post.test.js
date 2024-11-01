const request = require('supertest');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { app } = require('../app');
const { Post } = require('../models/post');
const { User } = require('../models/user');

const postBody = "This is a test content for blog post api."

describe('Posts API', () => {
  let testUser;
  let userToken;
  let testPost;

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
    await Post.deleteMany({});

    // Create test user
    testUser = new User({
      email: 'test1@example.com',
      password: 'password123',
      displayName: 'TestUser012',
      role: 'user'
    });

    await testUser.save();
    userToken = await testUser.generateAuthToken();

    // Create test post
    testPost = new Post({
      title: 'Test Post',
      category: 'Test Category',
      author: testUser.displayName,
      body: postBody
    });
    await testPost.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/posts', () => {
    it('should return all posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.posts.length).toBe(1);
      expect(response.body.posts[0].title).toBe(testPost.title);
    });
  });

  describe('GET /api/posts/search', () => {
    it('should search posts by title', async () => {
      const response = await request(app)
        .get('/api/posts/search?query=Test')
        .expect(200);

      expect(response.body.posts.length).toBe(1);
      expect(response.body.posts[0].title).toBe(testPost.title);
    });

    it('should search posts by author', async () => {
      const response = await request(app)
        .get(`/api/posts/search?query=${testUser.displayName}`)
        .expect(200);

      expect(response.body.posts.length).toBe(1);
      expect(response.body.posts[0].author).toBe(testUser.displayName);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/posts/search?query=NonExistent')
        .expect(200);

      expect(response.body.posts.length).toBe(0);
    });
  });

  describe('POST /api/posts', () => {
    it('should create new post with valid data', async () => {
      const newPost = {
        title: 'New Post',
        category: 'New Category',
        body: postBody
      };      

      const response = await request(app)
        .post('/api/posts')
        .set('x-auth', userToken)
        .send(newPost)
        .expect(201);        

      expect(response.body.post.title).toBe(newPost.title);
      expect(response.body.post.category).toBe(newPost.category);
      expect(response.body.post.body).toBe(newPost.body);
      expect(response.body.post.author).toBe(testUser.displayName);
    });

    it('should not create post with invalid data', async () => {
      const newPost = {
        title: '',
        category: '',
        body: ''
      };

      const response = await request(app)
        .post('/api/posts')
        .set('x-auth', userToken)
        .send(newPost)
        .expect(400);

      expect(response.body.error).toBeTruthy();
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post by id', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('x-auth', userToken)
        .expect(200);

      expect(response.body.message).toBe('Post deleted successfully.');

      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    it('should reject deletion of non-existent post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${new ObjectId()}`)
        .set('x-auth', userToken)
        .expect(404);

      expect(response.body.error).toBeTruthy();
    });

    it('should reject unauthorized deletion', async () => {
      const adminUser = new User({
        email: 'admin01@example.com',
        password: 'admin123',
        displayName: 'AdminUser001',
        role: 'admin'
      });

      await adminUser.save();
      const adminToken = await adminUser.generateAuthToken();

      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('x-auth', adminToken)
        .expect(403);

      expect(response.body.error).toBeTruthy();
    });
  });
});
