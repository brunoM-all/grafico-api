const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const WIDTH = 1200;
const HEIGHT = 600;

const renderer = new ChartJSNodeCanvas({
  width: WIDTH,
  height: HEIGHT,
  backgroundColour: '#1a1a2e',
});

function getBarColor(percentage) {
  // Roxo escuro (100%) → lavanda claro (mínimo)
  const colors = [
    { pct: 1.0, r: 91,  g: 91,  b: 214 },  // #5b5bd6
    { pct: 0.8, r: 139, g: 130, b: 230 },
    { pct: 0.6, r: 167, g: 158, b: 240 },
    { pct: 0.4, r: 196, g: 181, b: 253 },  // #c4b5fd
  ];

  let lower = colors[colors.length - 1];
  let upper = colors[0];

  for (let i = 0; i < colors.length - 1; i++) {
    if (percentage >= colors[i + 1].pct && percentage <= colors[i].pct) {
      lower = colors[i + 1];
      upper = colors[i];
      break;
    }
  }

  const range = upper.pct - lower.pct;
  const factor = range === 0 ? 1 : (percentage - lower.pct) / range;

  const r = Math.round(lower.r + factor * (upper.r - lower.r));
  const g = Math.round(lower.g + factor * (upper.g - lower.g));
  const b = Math.round(lower.b + factor * (upper.b - lower.b));

  return `rgb(${r}, ${g}, ${b})`;
}

async function generateChart({ title, subtitle, players }) {
  const maxScore = Math.max(...players.map(p => p.score));

  const labels = players.map(p => p.name);
  const scores = players.map(p => p.score);
  const percentages = players.map(p => p.score / maxScore);
  const backgroundColors = percentages.map(pct => getBarColor(pct));

  const configuration = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: scores,
        backgroundColor: backgroundColors,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: [title || 'Pontuações', subtitle || ''],
          color: '#9ca3af',
          font: { size: 16, weight: 'normal' },
          padding: { bottom: 20 },
        },
        datalabels: false,
      },
      scales: {
        x: {
          ticks: { color: '#9ca3af', font: { size: 13 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          min: Math.min(...scores) - 20,
          ticks: { color: '#6b7280', font: { size: 12 } },
          grid: { color: '#2d2d44' },
          border: { display: false },
        },
      },
    },
    plugins: [{
      // Labels acima das barras com score e percentual
      id: 'topLabels',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        chart.data.datasets[0].data.forEach((value, index) => {
          const meta = chart.getDatasetMeta(0);
          const bar = meta.data[index];
          const pct = ((value / maxScore) * 100).toFixed(1);

          ctx.save();
          ctx.textAlign = 'center';
          ctx.fillStyle = '#9ca3af';
          ctx.font = '12px sans-serif';
          ctx.fillText(players[index].name, bar.x, bar.y - 40);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(value, bar.x, bar.y - 20);

          ctx.fillStyle = '#9ca3af';
          ctx.font = '12px sans-serif';
          ctx.fillText(`${pct}%`, bar.x, bar.y - 4);
          ctx.restore();
        });
      },
    }],
  };

  return renderer.renderToBuffer(configuration);
}

module.exports = { generateChart };
