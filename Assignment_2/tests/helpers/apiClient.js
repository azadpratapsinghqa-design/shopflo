// tests/helpers/apiClient.js
const axios = require('axios');

const BASE_URL = 'https://fakestoreapi.com';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true, // Don't throw on 4xx/5xx — let tests assert
});

// Attach token to requests when set
let authToken = null;

function setToken(token) { authToken = token; }
function clearToken()    { authToken = null; }

async function request(method, path, data = null, useAuth = false) {
  const headers = {};
  if (useAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const response = await client({ method, url: path, data, headers });
  return response;
}

async function getToken() {
  const res = await client.post('/auth/login', {
    username: 'mor_2314',
    password: '83r5^_',
  });
  return res.data.token;
}

module.exports = { request, setToken, clearToken, getToken, BASE_URL };
