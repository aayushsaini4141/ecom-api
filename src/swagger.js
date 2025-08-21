const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecom API',
      version: '1.0.0',
      description: 'API documentation for Ecom API (all endpoints, public)',
    },
    servers: [
      { url: 'http://localhost:3000/api' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // JSDoc comments in route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
