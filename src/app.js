/**
 * @file app.js
 * @description Main entry point for the Blog Platform API server application.
 * Configures and starts an Express server with middleware and route handling for posts and users.
 * Connects to the database and serves API documentation using Swagger UI.
 *
 * @requires express - Web framework for Node.js.
 * @requires body-parser - Middleware for parsing incoming request bodies.
 * @requires cors - Middleware for enabling CORS (Cross-Origin Resource Sharing).
 * @requires swagger-ui-express - Middleware for serving Swagger-generated API documentation.
 * @requires dotenv - Loads environment variables from a `.env` file into `process.env`.
 * @requires ./config/db - Database connection logic.
 * @requires ./config/config - Additional configuration logic.
 * @requires ./config/swagger - Swagger configuration object for API documentation.
 * @requires ./routes/postRoutes - Routes for managing blog posts.
 * @requires ./routes/userRoutes - Routes for managing user accounts.
 *
 * @constant {string} port - Port on which the server will run (default: 4000).
 * @constant {object} corsOptions - CORS options, specifying exposed headers.
 * @constant {object} app - Express application instance.
 *
 * Middleware:
 * - `/api-docs`: Serves API documentation using Swagger UI.
 * - `cors`: Enables CORS with specified options.
 * - `body-parser`: Parses incoming JSON requests.
 *
 * Routes:
 * - `/api/posts`: Routes for post-related operations.
 * - `/api/users`: Routes for user-related operations.
 *
 * The server is started only if the script is executed directly (not imported as a module).
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

require('./config/config');
const { swaggerDocument, swaggerOptions } = require('./config/swagger');


if(process.env.NODE_ENV != "test"){
  connectDB();
}

const app = express();
const port = process.env.PORT || 4000;

const corsOptions = { exposedHeaders: 'x-auth' };

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Import and use routes
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/users', require('./routes/userRoutes'));


module.exports = { app };


// Start the server only if this file is executed directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  });
}
