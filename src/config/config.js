const env = process.env.NODE_ENV || 'development';

if (!process.env.MONGODB_URI && process.env.NODE_ENV != "test") {
  console.error('CRITICAL: NO MONGODB_URI found');
  console.error('Current environment variables:', JSON.stringify(process.env, null, 2));
  process.exit(1);
}


console.log('Configuration:', {
  env,
  PORT: process.env.PORT || 4000,
  MONGODB_URI: process.env.MONGODB_URI ? 'DEFINED' : 'UNDEFINED'
});

module.exports = {
  env,
  PORT: process.env.PORT || 4000,
  MONGODB_URI: process.env.MONGODB_URI
};