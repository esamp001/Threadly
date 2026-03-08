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
const maincontent = require('./routes/maincontent.routes');
const comments = require('./routes/comments.routes');

app.use('/api/cloudinary', cloudinary);
app.use('/api/header', header);
app.use('/api/maincontent', maincontent);
app.use('/api/comments', comments);

module.exports = app;