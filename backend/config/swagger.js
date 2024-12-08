const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PIA API Documentation',
      version: '1.0.0',
      description: 'API documentation for Personal Income & Expense Application',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'], // path to API routes
};

const specs = swaggerJsdoc(options);
module.exports = specs;