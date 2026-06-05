// tests/cart-crud.test.js
const { request } = require('./helpers/apiClient');
const { cartSchema } = require('../schemas/cartSchemas');
const { validateSchema } = require('./helpers/schemaValidator');

const validCartPayload = {
  userId: 5,
  date: '2024-12-10',
  products: [
    { productId: 5, quantity: 1 },
    { productId: 1, quantity: 3 },
  ],
};

// ── POST ─────────────────────────────────────────────────────────────────────
describe('Cart — POST (Create)', () => {

  describe('Positive', () => {

    test('POST /carts creates a cart and returns 200 or 201 with new cart id', async () => {
      const res = await request('POST', '/carts', validCartPayload);
      expect([200, 201]).toContain(res.status);
      expect(res.data).toHaveProperty('id');
      expect(typeof res.data.id).toBe('number');
    });

    test('POST /carts response matches cart schema', async () => {
      const res = await request('POST', '/carts', validCartPayload);
      expect([200, 201]).toContain(res.status);
      const { valid, errors } = validateSchema(cartSchema, res.data);
      expect(valid).toBe(true);
      if (!valid) console.error('Schema errors:', errors);
    });

    test('POST /carts with single product creates cart', async () => {
      const payload = {
        userId: 3,
        date: '2024-11-01',
        products: [{ productId: 2, quantity: 2 }],
      };
      const res = await request('POST', '/carts', payload);
      expect([200, 201]).toContain(res.status);
      expect(res.data).toHaveProperty('id');
    });

    test('POST /carts reflects submitted products in response', async () => {
      const res = await request('POST', '/carts', validCartPayload);
      expect([200, 201]).toContain(res.status);
      expect(res.data.products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ productId: 5, quantity: 1 }),
          expect.objectContaining({ productId: 1, quantity: 3 }),
        ])
      );
    });

    test('POST /carts sets correct userId in response', async () => {
      const res = await request('POST', '/carts', validCartPayload);
      expect([200, 201]).toContain(res.status);
      expect(res.data.userId).toBe(validCartPayload.userId);
    });
  });

  describe('Negative', () => {

    test('POST /carts with empty products array — FakeStore is lenient', async () => {
      const res = await request('POST', '/carts', {
        userId: 1,
        date: '2024-01-01',
        products: [],
      });
      expect([200, 201, 400]).toContain(res.status);
    });

    test('POST /carts with missing userId — FakeStore is lenient', async () => {
      const res = await request('POST', '/carts', {
        date: '2024-01-01',
        products: [{ productId: 1, quantity: 1 }],
      });
      expect([200, 201, 400]).toContain(res.status);
    });

    test('POST /carts with invalid product ID returns response', async () => {
      const res = await request('POST', '/carts', {
        userId: 1,
        date: '2024-01-01',
        products: [{ productId: 99999, quantity: 1 }],
      });
      expect([200, 201, 400, 404]).toContain(res.status);
    });

    test('POST /carts with negative quantity returns response', async () => {
      const res = await request('POST', '/carts', {
        userId: 1,
        date: '2024-01-01',
        products: [{ productId: 1, quantity: -5 }],
      });
      expect([200, 201, 400]).toContain(res.status);
    });
  });
});

// ── PUT ──────────────────────────────────────────────────────────────────────
describe('Cart — PUT (Update)', () => {

  describe('Positive', () => {

    test('PUT /carts/1 updates cart and returns updated data', async () => {
      const updatePayload = {
        userId: 3,
        date: '2024-12-15',
        products: [
          { productId: 1, quantity: 2 },
          { productId: 3, quantity: 1 },
        ],
      };
      const res = await request('PUT', '/carts/1', updatePayload);
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('id');
      expect(res.data.userId).toBe(updatePayload.userId);
    });

    test('PUT /carts/1 response matches cart schema', async () => {
      const res = await request('PUT', '/carts/1', validCartPayload);
      expect(res.status).toBe(200);
      const { valid, errors } = validateSchema(cartSchema, res.data);
      expect(valid).toBe(true);
      if (!valid) console.error('Schema errors:', errors);
    });

    test('PATCH /carts/1 partially updates cart', async () => {
      const res = await request('PATCH', '/carts/1', {
        products: [{ productId: 7, quantity: 3 }],
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('id');
    });
  });

  describe('Negative', () => {

    test('PUT /carts/9999 on non-existent cart — FakeStore returns 200 with echoed data (known behaviour)', async () => {
      const res = await request('PUT', '/carts/9999', validCartPayload);
      // FakeStoreAPI is a mock — it echoes back even for non-existent IDs
      // This documents the known permissive behaviour
      expect([200, 400, 404]).toContain(res.status);
    });

    test('PUT /carts/abc with invalid id returns error', async () => {
      const res = await request('PUT', '/carts/abc', validCartPayload);
      expect([400, 404, 500]).toContain(res.status);
    });
  });
});

// ── DELETE ───────────────────────────────────────────────────────────────────
describe('Cart — DELETE', () => {

  describe('Positive', () => {

    test('DELETE /carts/6 returns 200 with deleted cart data', async () => {
      const res = await request('DELETE', '/carts/6');
      // FakeStoreAPI returns 200 for DELETE with the cart object
      expect([200, 201]).toContain(res.status);
      expect(res.data).toHaveProperty('id');
    });

    test('DELETE /carts/6 response has required cart fields', async () => {
      const res = await request('DELETE', '/carts/6');
      expect([200, 201]).toContain(res.status);
      // Check required fields manually (schema may be slightly different for delete response)
      expect(res.data).toHaveProperty('id');
      expect(res.data).toHaveProperty('userId');
      expect(res.data).toHaveProperty('products');
    });
  });

  describe('Negative', () => {

    test('DELETE /carts/9999 on non-existent cart — FakeStore known permissive behaviour', async () => {
      const res = await request('DELETE', '/carts/9999');
      // FakeStoreAPI echoes back even for non-existent IDs — document this known behaviour
      expect([200, 400, 404]).toContain(res.status);
    });

    test('DELETE /carts/abc with invalid ID returns error', async () => {
      const res = await request('DELETE', '/carts/abc');
      expect([400, 404, 500]).toContain(res.status);
    });
  });
});
