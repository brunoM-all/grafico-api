const express = require('express');
const router = express.Router();
const { generateChart } = require('../services/chartService');
const { fetchChartData } = require('../services/dataService');

// POST /chart — recebe dados e retorna PNG
router.post('/', async (req, res) => {
  try {
    const { title, subtitle, players } = req.body;

    if (!players || !Array.isArray(players) || players.length === 0) {
      return res.status(400).json({ error: 'Campo "players" é obrigatório e deve ser um array' });
    }

    const imageBuffer = await generateChart({ title, subtitle, players });

    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Erro ao gerar gráfico:', err.message);
    res.status(500).json({ error: 'Erro interno ao gerar gráfico' });
  }
});

// GET /chart/live — busca dados da API externa e retorna PNG
router.get('/live', async (req, res) => {
  try {
    const data = await fetchChartData(req.query);
    const imageBuffer = await generateChart(data);

    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Erro no /chart/live:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
