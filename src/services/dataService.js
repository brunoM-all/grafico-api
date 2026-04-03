const axios = require('axios');

const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL;
const EXTERNAL_API_KEY = process.env.EXTERNAL_API_KEY;

async function fetchChartData(params = {}) {
  if (!EXTERNAL_API_URL) {
    throw new Error('EXTERNAL_API_URL não configurada no .env');
  }

  const response = await axios.get(EXTERNAL_API_URL, {
    params,
    headers: EXTERNAL_API_KEY ? { Authorization: `Bearer ${EXTERNAL_API_KEY}` } : {},
  });

  // Adapte este mapeamento conforme o formato da sua API externa
  return response.data;
}

module.exports = { fetchChartData };
