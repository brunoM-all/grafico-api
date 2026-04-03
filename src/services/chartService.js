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

module.exports = { generateChart };
