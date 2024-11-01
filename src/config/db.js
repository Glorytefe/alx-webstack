const mongoose = require('mongoose');
const connectDB = async () => {

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      retryWrites: true,
      writeConcern: { w: 'majority', wtimeout: 5000 }, 
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,  
    };

    console.log('Attempting to connect with URI:', 
      process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')
    );


    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('Successfully connected to database.');
  } catch (error) {
    console.error('Database connection error:', error);
    
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB disconnection:', err);
    process.exit(1);
  }
});

module.exports = connectDB;

