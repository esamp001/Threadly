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

app.use('/api/cloudinary', cloudinary);

module.exports = app;