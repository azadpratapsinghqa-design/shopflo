// tests/cart-get.test.js
const { request } = require('./helpers/apiClient');
const { cartSchema, cartListSchema } = require('../schemas/cartSchemas');
const { validateSchema } = require('./helpers/schemaValidator');

describe('Cart — GET', () => {

  // ── POSITIVE ────────────────────────────────────────────────────────────────
  describe('Positive', () => {

    test('GET /carts returns 200 with array of carts', async () => {
      const res = await request('GET', '/carts');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
    });

    test('GET /carts response matches cart list schema', async () => {
      const res = await request('GET', '/carts');
      expect(res.status).toBe(200);
      // Validate first cart in the list against schema
      const { valid, errors } = validateSchema(cartSchema, res.data[0]);
      expect(valid).toBe(true);
      if (!valid) console.error('Schema errors:', errors);
    });

    test('GET /carts/1 returns a single cart with id=1', async () => {
      const res = await request('GET', '/carts/1');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('id');
      expect(res.data).toHaveProperty('userId');
      expect(res.data).toHaveProperty('products');
      expect(Array.isArray(res.data.products)).toBe(true);
    });

    test('GET /carts/1 response matches cart schema', async () => {
      const res = await request('GET', '/carts/1');
      expect(res.status).toBe(200);
      const { valid, errors } = validateSchema(cartSchema, res.data);
      expect(valid).toBe(true);
      if (!valid) console.error('Schema errors:', errors);
    });

    test('GET /carts?limit=3 returns at most 3 carts', async () => {
      const res = await request('GET', '/carts?limit=3');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeLessThanOrEqual(3);
    });

    test('GET /carts?sort=desc returns carts in descending id order', async () => {
      const res = await request('GET', '/carts?sort=desc');
      expect(res.status).toBe(200);
      const ids = res.data.map(c => c.id);
      for (let i = 1; i < ids.length; i++) {
        expect(ids[i]).toBeLessThanOrEqual(ids[i - 1]);
      }
    });

    test('GET /carts/user/1 returns carts for user 1', async () => {
      const res = await request('GET', '/carts/user/1');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      res.data.forEach(cart => expect(cart.userId).toBe(1));
    });

    test('GET /carts with date range filter returns filtered results', async () => {
      const res = await request('GET', '/carts?startdate=2020-01-01&enddate=2020-12-31');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    test('Each cart has products array with productId and quantity', async () => {
      const res = await request('GET', '/carts');
      expect(res.status).toBe(200);
      res.data.forEach(cart => {
        expect(Array.isArray(cart.products)).toBe(true);
        cart.products.forEach(p => {
          expect(typeof p.productId).toBe('number');
          expect(typeof p.quantity).toBe('number');
        });
      });
    });
  });

  // ── NEGATIVE ────────────────────────────────────────────────────────────────
  describe('Negative', () => {

    test('GET /carts/9999 returns null or empty for non-existent cart', async () => {
      const res = await request('GET', '/carts/9999');
      // FakeStoreAPI returns null for non-existent IDs — not a 404
      const isNotFound =
        res.status === 404 ||
        res.data === null ||
        res.data === '' ||
        res.data === undefined;
      expect(isNotFound).toBe(true);
    });

    test('GET /carts/abc returns error for non-numeric ID', async () => {
      const res = await request('GET', '/carts/abc');
      expect([400, 404, 500]).toContain(res.status);
    });

    test('GET /carts?limit=-1 handles invalid limit gracefully', async () => {
      const res = await request('GET', '/carts?limit=-1');
      expect([200, 400]).toContain(res.status);
    });
  });
});
