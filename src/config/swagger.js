const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
};

module.exports = { swaggerUi, swaggerDocument, swaggerOptions };
