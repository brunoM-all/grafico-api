require('dotenv').config();
const express = require('express');
const chartRoutes = require('./routes/chart');

const app = express();
app.use(express.json());

app.use('/chart', chartRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
