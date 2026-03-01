const dotenv = require('dotenv');
const app = require('./app.js');

// Auto-detect environment and load appropriate .env file
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

const PORT = process.env.PORT || (env === 'production' ? 3001 : 3000);

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.toUpperCase()} mode on port ${PORT}`);
  console.log(`📍 Origin: ${process.env.ORIGIN}`);
});