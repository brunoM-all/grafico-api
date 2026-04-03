const express = require('express');
const router = express.Router();
const { generateChart } = require('../services/chartService');
const { fetchChartData } = require('../services/dataService');

/**
 * @swagger
 * /chart/live:
 *   get:
 *     summary: Gera gráfico com dados da API externa
 *     description: Busca os dados de pontuação da API externa e retorna uma imagem PNG com o gráfico de barras.
 *     parameters:
 *       - in: query
 *         name: inicio
 *         schema:
 *           type: integer
 *         description: "Timestamp em milissegundos do início do período (ex: 1775098800000)"
 *       - in: query
 *         name: fim
 *         schema:
 *           type: integer
 *         description: "Timestamp em milissegundos do fim do período (ex: 1775185140000)"
 *       - in: query
 *         name: titulo
 *         schema:
 *           type: string
 *         description: "Título do gráfico (padrão: Pontuações)"
 *       - in: query
 *         name: subtitulo
 *         schema:
 *           type: string
 *         description: "Período exibido abaixo do título (padrão: gerado a partir de inicio/fim)"
 *     responses:
 *       200:
 *         description: Imagem PNG do gráfico
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Erro ao buscar dados ou gerar gráfico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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

/**
 * @swagger
 * /chart:
 *   post:
 *     summary: Gera gráfico com dados manuais
 *     description: Recebe os dados diretamente no corpo da requisição e retorna uma imagem PNG.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - players
 *             properties:
 *               title:
 *                 type: string
 *                 example: Pontuações
 *               subtitle:
 *                 type: string
 *                 description: Período exibido abaixo do título
 *                 example: 02/04/2026 — Dia completo
 *               players:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - score
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: A2
 *                     score:
 *                       type: integer
 *                       example: 407
 *           example:
 *             title: Pontuações
 *             subtitle: 02/04/2026 — Dia completo
 *             players:
 *               - name: A2
 *                 score: 407
 *               - name: A1
 *                 score: 379
 *               - name: A5
 *                 score: 379
 *               - name: A4
 *                 score: 354
 *               - name: Facundo
 *                 score: 352
 *     responses:
 *       200:
 *         description: Imagem PNG do gráfico
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erro interno
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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

module.exports = router;
