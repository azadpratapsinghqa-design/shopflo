// tests/auth.test.js
const { request } = require('./helpers/apiClient');
const { authResponseSchema } = require('../schemas/cartSchemas');
const { validateSchema } = require('./helpers/schemaValidator');

describe('Authentication', () => {

  test('POST /auth/login with valid credentials returns 200 and JWT', async () => {
    const res = await request('POST', '/auth/login', {
      username: 'mor_2314',
      password: '83r5^_',
    });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('token');
    expect(typeof res.data.token).toBe('string');
    expect(res.data.token.length).toBeGreaterThan(10);
  });

  test('POST /auth/login response conforms to auth schema', async () => {
    const res = await request('POST', '/auth/login', {
      username: 'mor_2314',
      password: '83r5^_',
    });
    const { valid, errors } = validateSchema(authResponseSchema, res.data);
    expect(valid).toBe(true);
    if (!valid) console.error('Schema errors:', errors);
  });

  test('POST /auth/login with wrong password returns 401', async () => {
    const res = await request('POST', '/auth/login', {
      username: 'mor_2314',
      password: 'wrongpassword',
    });
    // FakeStoreAPI returns 401 for wrong creds
    expect(res.status).toBe(401);
  });

  test('POST /auth/login with missing fields returns error', async () => {
    const res = await request('POST', '/auth/login', { username: 'mor_2314' });
    expect([400, 401]).toContain(res.status);
  });

  test('POST /auth/login with non-existent user returns 401', async () => {
    const res = await request('POST', '/auth/login', {
      username: 'nonexistent_user_xyz',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });
});
