// Store all registed routes and middleware
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(express.json());

// Middleware
app.use(cors({
  origin: process.env.ORIGIN,
  credentials: process.env.CREDENTIALS === 'true',
}));

// All register routes here
const cloudinary = require('./routes/cloudinary');
const header = require('./routes/header.routes');

app.use('/api/cloudinary', cloudinary);
app.use('/api/header', header);

module.exports = app;