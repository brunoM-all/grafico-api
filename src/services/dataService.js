const axios = require('axios');

const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL;

async function fetchChartData({ inicio, fim, titulo } = {}) {
  if (!EXTERNAL_API_URL) {
    throw new Error('EXTERNAL_API_URL não configurada no .env');
  }

  const params = {};
  if (inicio) params.inicio = inicio;
  if (fim) params.fim = fim;

  const response = await axios.get(EXTERNAL_API_URL, {
    params,
    headers: { accept: 'application/json' },
  });

  // Resposta: { "A1": 379, "A2": 407, "A4": 354, "A5": 379, "FACUNDO": 352 }
  const raw = response.data;

  const players = Object.entries(raw)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  const date = resolveSubtitle(inicio, fim);

  return {
    title: titulo || 'Pontuações',
    subtitle: date,
    players,
  };
}

function resolveSubtitle(inicio, fim) {
  if (!inicio && !fim) return 'Dia completo';

  const fmt = (ts) =>
    new Date(Number(ts)).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    });

  if (inicio && fim) return `${fmt(inicio)} — ${fmt(fim)}`;
  if (inicio) return `A partir de ${fmt(inicio)}`;
  return `Até ${fmt(fim)}`;
}

module.exports = { fetchChartData };
