// tests/cart-datadriven.test.js
const { request } = require('./helpers/apiClient');
const { CART_SNAPSHOT, cartSchema } = require('../schemas/cartSchemas');
const { validateSchema } = require('./helpers/schemaValidator');

// ── DATA-DRIVEN TEST ──────────────────────────────────────────────────────────
const productTestCases = [
  { productId: 1,  quantity: 2, description: 'Fjallraven Backpack' },
  { productId: 3,  quantity: 1, description: 'Mens Cotton Jacket' },
  { productId: 7,  quantity: 3, description: 'White Gold Polished Diamond Ring' },
  { productId: 12, quantity: 1, description: 'WD 2TB Green Portable HDD' },
  { productId: 18, quantity: 5, description: 'MBJ Womens Solid Short Sleeve' },
];

describe('Cart — Data-Driven POST (multiple product IDs)', () => {

  test.each(productTestCases)(
    'POST /carts with productId=$productId ($description) creates cart successfully',
    async ({ productId, quantity }) => {
      const payload = {
        userId: 1,
        date: new Date().toISOString().split('T')[0],
        products: [{ productId, quantity }],
      };

      const res = await request('POST', '/carts', payload);

      // FakeStoreAPI returns 200 or 201 for POST
      expect([200, 201]).toContain(res.status);
      expect(res.data).toHaveProperty('id');
      expect(typeof res.data.id).toBe('number');
      expect(res.data.products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ productId, quantity }),
        ])
      );
    }
  );

  test.each(productTestCases)(
    'POST /carts with productId=$productId response schema is valid',
    async ({ productId, quantity }) => {
      const payload = {
        userId: 2,
        date: '2024-10-01',
        products: [{ productId, quantity }],
      };
      const res = await request('POST', '/carts', payload);
      const { valid, errors } = validateSchema(cartSchema, res.data);
      expect(valid).toBe(true);
      if (!valid) console.error(`Schema error for productId ${productId}:`, errors);
    }
  );
});

// ── CONTRACT / SNAPSHOT TEST ──────────────────────────────────────────────────
describe('Cart — Contract / Schema Snapshot Test', () => {

  test('GET /carts response shape conforms to baseline contract snapshot', async () => {
    const res = await request('GET', '/carts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);

    res.data.forEach((cart) => {
      // Assert all required top-level keys exist
      CART_SNAPSHOT.requiredKeys.forEach(key => {
        expect(cart).toHaveProperty(key);
      });

      // Assert type contracts
      expect(typeof cart.id).toBe(CART_SNAPSHOT.idType);
      expect(typeof cart.userId).toBe(CART_SNAPSHOT.userIdType);
      expect(typeof cart.date).toBe(CART_SNAPSHOT.dateType);
      expect(Array.isArray(cart.products)).toBe(true);

      // Assert each product item has expected keys
      cart.products.forEach(product => {
        CART_SNAPSHOT.productsItem.forEach(key => {
          expect(product).toHaveProperty(key);
        });
        expect(typeof product.productId).toBe('number');
        expect(typeof product.quantity).toBe('number');
      });
    });
  });

  test('GET /carts/1 contract: id field is always numeric', async () => {
    const res = await request('GET', '/carts/1');
    expect(res.status).toBe(200);
    expect(typeof res.data.id).toBe('number');
  });

  test('GET /carts/1 contract: products is always an array (never null/undefined)', async () => {
    const res = await request('GET', '/carts/1');
    expect(res.status).toBe(200);
    expect(res.data.products).not.toBeNull();
    expect(res.data.products).not.toBeUndefined();
    expect(Array.isArray(res.data.products)).toBe(true);
  });

  test('POST /carts contract: response always has id, userId, products', async () => {
    const res = await request('POST', '/carts', {
      userId: 9,
      date: '2024-01-15',
      products: [{ productId: 4, quantity: 1 }],
    });
    expect([200, 201]).toContain(res.status);
    CART_SNAPSHOT.requiredKeys.forEach(key => {
      expect(res.data).toHaveProperty(key);
    });
  });

  test('AJV full schema validation: GET /carts/1 strictly matches cart schema', async () => {
    const res = await request('GET', '/carts/1');
    expect(res.status).toBe(200);
    const { valid, errors } = validateSchema(cartSchema, res.data);
    expect(valid).toBe(true);
    if (!valid) {
      console.error('Contract violation! Schema errors:', errors);
    }
  });
});
