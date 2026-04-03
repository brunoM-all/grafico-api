const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Grafico API',
      version: '1.0.0',
      description: 'API de geração de gráficos de barras em PNG',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Local' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
