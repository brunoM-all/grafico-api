const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const WIDTH  = 1400;
const HEIGHT = 680;
const BG     = '#18181f';

const renderer = new ChartJSNodeCanvas({ width: WIDTH, height: HEIGHT, backgroundColour: BG });

// Normaliza as cores pelo range real dos scores (mínimo → mais claro, máximo → mais escuro)
function getBarColors(players) {
  const scores = players.map(p => p.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const range = maxScore - minScore || 1;

  const dark  = { r: 75,  g: 68,  b: 205 }; // #4b44cd — roxo escuro
  const light = { r: 210, g: 205, b: 248 }; // #d2cdf8 — lavanda claro

  return players.map(p => {
    const t = (p.score - minScore) / range; // 0 = mais claro, 1 = mais escuro
    const r = Math.round(light.r + t * (dark.r - light.r));
    const g = Math.round(light.g + t * (dark.g - light.g));
    const b = Math.round(light.b + t * (dark.b - light.b));
    return `rgb(${r},${g},${b})`;
  });
}

async function generateChart({ title, subtitle, players }) {
  const maxScore = Math.max(...players.map(p => p.score));
  const minScore = Math.min(...players.map(p => p.score));
  const backgroundColors = getBarColors(players);

  const TOP_SECTION = 120; // altura reservada para os stats no topo

  const configuration = {
    type: 'bar',
    data: {
      labels: players.map(p => p.name),
      datasets: [{
        data: players.map(p => p.score),
        backgroundColor: backgroundColors,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.6,
      }],
    },
    options: {
      responsive: false,
      animation: false,
      layout: {
        padding: { top: TOP_SECTION, left: 10, right: 10, bottom: 10 },
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: [title || 'Pontuações', subtitle || ''],
          color: '#9ca3af',
          font: { size: 15, weight: 'normal' },
          padding: { top: 0, bottom: 16 },
        },
      },
      scales: {
        x: {
          ticks: { color: '#9ca3af', font: { size: 13 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          min: minScore - 20,
          ticks: { color: '#6b7280', font: { size: 12 }, maxTicksLimit: 8 },
          grid: { color: '#25253a' },
          border: { display: false },
        },
      },
    },
    plugins: [{
      id: 'topStats',
      beforeDraw(chart) {
        const { ctx } = chart;
        const slotWidth = WIDTH / players.length;

        players.forEach((p, i) => {
          const cx = slotWidth * i + slotWidth / 2;
          const pct = ((p.score / maxScore) * 100).toFixed(1);

          // Nome
          ctx.save();
          ctx.textAlign = 'center';
          ctx.fillStyle = '#9ca3af';
          ctx.font = '13px sans-serif';
          ctx.fillText(p.name, cx, 28);

          // Score
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText(p.score, cx, 72);

          // Percentual
          ctx.fillStyle = '#9ca3af';
          ctx.font = '13px sans-serif';
          ctx.fillText(`${pct}%`, cx, 96);
          ctx.restore();
        });
      },
    }],
  };

  return renderer.renderToBuffer(configuration);
}

const DEVICE_COLORS = [
  '#4b44cd', // roxo escuro
  '#a78bfa', // lavanda
  '#60a5fa', // azul
  '#34d399', // verde
  '#f472b6', // rosa
];

async function generateRangeChart({ title, subtitle, labels, datasets }) {
  const width = Math.max(1400, labels.length * 180);
  const rangeRenderer = new ChartJSNodeCanvas({ width, height: HEIGHT, backgroundColour: BG });

  const chartDatasets = datasets.map((ds, i) => ({
    label: ds.name,
    data: ds.data,
    backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length],
    borderRadius: 4,
    borderSkipped: false,
    barPercentage: 0.85,
    categoryPercentage: 0.7,
  }));

  const allValues = datasets.flatMap(ds => ds.data).filter(v => v > 0);
  const minVal = allValues.length ? Math.min(...allValues) : 0;
  const maxVal = allValues.length ? Math.max(...allValues) : 100;

  const configuration = {
    type: 'bar',
    data: { labels, datasets: chartDatasets },
    options: {
      responsive: false,
      animation: false,
      layout: { padding: { top: 30, left: 10, right: 10, bottom: 10 } },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#9ca3af', font: { size: 13 }, padding: 20 },
        },
        title: {
          display: true,
          text: [title || 'Pontuações por período', subtitle || ''],
          color: '#9ca3af',
          font: { size: 15, weight: 'normal' },
          padding: { top: 0, bottom: 12 },
        },
      },
      scales: {
        x: {
          ticks: { color: '#9ca3af', font: { size: 12 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          min: Math.max(0, minVal - 20),
          max: Math.ceil(maxVal * 1.15),
          ticks: { color: '#6b7280', font: { size: 12 }, maxTicksLimit: 8 },
          grid: { color: '#25253a' },
          border: { display: false },
        },
      },
    },
    plugins: [{
      id: 'barLabels',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        chart.data.datasets.forEach((_, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          meta.data.forEach((bar, index) => {
            const value = chart.data.datasets[datasetIndex].data[index];
            if (!value) return;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText(value, bar.x, bar.y - 4);
            ctx.restore();
          });
        });
      },
    }],
  };

  return rangeRenderer.renderToBuffer(configuration);
}

module.exports = { generateChart, generateRangeChart };
