const axios = require('axios');

const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL;

// Converte "dd/mm/yyyy" para timestamp ms do início do dia em SP (UTC-3)
function parseDateBR(dateStr) {
  const [day, month, year] = dateStr.trim().split('/').map(Number);
  return Date.UTC(year, month - 1, day, 3, 0, 0); // 00:00 SP = 03:00 UTC
}

async function fetchChartDataRange({ inicio, fim, dias, titulo, subtitulo } = {}) {
  if (!EXTERNAL_API_URL) throw new Error('EXTERNAL_API_URL não configurada no .env');

  let timestamps;
  if (dias) {
    timestamps = dias.split(',').map(parseDateBR);
  } else if (inicio && fim) {
    const startMs = parseDateBR(inicio);
    const endMs = parseDateBR(fim);
    timestamps = [];
    for (let t = startMs; t <= endMs; t += 86400000) timestamps.push(t);
  } else {
    throw new Error('Informe "inicio" e "fim" (dd/mm/yyyy) ou "dias" (datas separadas por vírgula)');
  }

  const results = await Promise.all(
    timestamps.map(async (dayStart) => {
      const dayEnd = dayStart + 86399000; // 23:59:59
      try {
        const response = await axios.get(`${EXTERNAL_API_URL}/entrack`, {
          params: { inicio: dayStart, fim: dayEnd },
          headers: { accept: 'application/json' },
        });
        return { dayStart, data: response.data };
      } catch (err) {
        console.error(`Erro ao buscar dados para ${new Date(dayStart).toISOString()}:`, err.message);
        return { dayStart, data: {} };
      }
    })
  );

  const deviceNames = [...new Set(results.flatMap(r => Object.keys(r.data)))].sort();

  const labels = results.map(r =>
    new Date(r.dayStart).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })
  );

  const datasets = deviceNames.map(name => ({
    name,
    data: results.map(r => r.data[name] ?? 0),
  }));

  const subtitleText = subtitulo || (dias ? `Dias: ${dias}` : `${inicio} — ${fim}`);

  return {
    title: titulo || 'Pontuações por período',
    subtitle: subtitleText,
    labels,
    datasets,
  };
}

async function fetchChartData({ inicio, fim, titulo, subtitulo } = {}) {
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
    subtitle: subtitulo || date,
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

module.exports = { fetchChartData, fetchChartDataRange };
