const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Auto-detect environment and load appropriate .env file
const env = process.env.NODE_ENV || 'development';
const dotEnvPath = path.join(__dirname, `.env.${env}`);
const legacyEnvPath = path.join(__dirname, `env.${env}`);

dotenv.config({
  path: fs.existsSync(dotEnvPath) ? dotEnvPath : legacyEnvPath,
});

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  migrations: {
    directory: './src/db/migrations',
  },
  seeds: {
    directory: './src/db/seeds',
  },
};
