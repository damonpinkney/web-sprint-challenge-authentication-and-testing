// Force testing environment
process.env.NODE_ENV = 'testing';

const request = require('supertest');
const server = require('./server');
const db = require('../data/dbConfig');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

test('sanity', () => {
  expect(true).not.toBe(false);
});

describe('Auth Endpoints', () => {
  describe('[POST] /api/auth/register', () => {
    it('returns 400 when missing username or password', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'bob' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("username and password required");
    });

    it('returns 400 when username taken', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'bob', password: '1234' });
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'bob', password: '1234' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("username taken");
    });
  });

  describe('[POST] /api/auth/login', () => {
    it('returns 400 when missing credentials', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'bob' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("username and password required");
    });

    it('returns 401 when invalid credentials', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'bob', password: '1234' });
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'bob', password: 'wrong' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("invalid credentials");
    });
  });
});

describe('Jokes Endpoint', () => {
  let token;

  beforeAll(async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'joker', password: '1234' });
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'joker', password: '1234' });
    token = res.body.token;
  });

  it('returns 401 without token', async () => {
    const res = await request(server).get('/api/jokes');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("token required");
  });

  it('returns jokes with valid token', async () => {
    const res = await request(server)
      .get('/api/jokes')
      .set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });
});