// schemas/cartSchemas.js
// Contract / schema definitions for FakeStoreAPI Cart responses

const cartItemSchema = {
  type: 'object',
  required: ['productId', 'quantity'],
  properties: {
    productId: { type: 'number' },
    quantity:  { type: 'number' },
  },
  additionalProperties: false,
};

const cartSchema = {
  type: 'object',
  required: ['id', 'userId', 'date', 'products'],
  properties: {
    id:       { type: 'number' },
    userId:   { type: 'number' },
    date:     { type: 'string' },
    products: {
      type:  'array',
      items: cartItemSchema,
    },
    __v: { type: 'number' },
  },
  additionalProperties: true, // allow __v
};

const cartListSchema = {
  type: 'array',
  items: cartSchema,
};

const authResponseSchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string', minLength: 10 },
  },
};

// Snapshot of a known good response shape (contract test baseline)
const CART_SNAPSHOT = {
  requiredKeys: ['id', 'userId', 'date', 'products'],
  productsItem: ['productId', 'quantity'],
  idType: 'number',
  userIdType: 'number',
  dateType: 'string',
  productsType: 'array',
};

module.exports = { cartSchema, cartListSchema, cartItemSchema, authResponseSchema, CART_SNAPSHOT };
