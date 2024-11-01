const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

require('./config/config');
const { swaggerDocument, swaggerOptions } = require('./config/swagger');


// dotenv.config();
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

// app.listen(port, () => {
//   console.log(`Server is up on port ${port}`);
// });


module.exports = { app };


// Start the server only if this file is executed directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  });
}
