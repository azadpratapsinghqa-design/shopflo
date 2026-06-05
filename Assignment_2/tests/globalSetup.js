// tests/globalSetup.js
const { getToken, setToken } = require('./helpers/apiClient');

module.exports = async () => {
  try {
    const token = await getToken();
    process.env.AUTH_TOKEN = token;
    console.log('\n✅ Auth token fetched for test session');
  } catch (e) {
    console.warn('\n⚠️  Could not fetch auth token:', e.message);
    process.env.AUTH_TOKEN = '';
  }
};
