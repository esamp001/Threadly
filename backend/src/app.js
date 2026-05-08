// Store all registed routes and middleware
const express = require('express');
const cors = require('cors');
const app = express();
const { globalRateLimit } = require('./middleware/rateLimiter');
require('dotenv').config();

app.use(express.json({ type: 'application/json', limit: '10mb' }));

// Middleware
app.use(cors({
  origin: process.env.ORIGIN,
  credentials: process.env.CREDENTIALS === 'true',
}));

// // Global rate limiting
app.use(globalRateLimit);

// All register routes here
const cloudinary = require('./routes/cloudinary');
const header = require('./routes/header.routes');
const maincontent = require('./routes/maincontent.routes');
const comments = require('./routes/comments.routes');
const auth = require('./routes/auth.routes');
const onboarding = require('./routes/onboarding.routes');
const space = require('./routes/spaces.routes');
const search = require('./routes/search.routes');
const exp = require('./routes/exp.routes');
const reports = require('./routes/reports.routes');
// const login = require('./routes/login.routes');

app.use('/api/cloudinary', cloudinary);
app.use('/api/header', header);
app.use('/api/maincontent', maincontent);
app.use('/api/comments', comments);
app.use('/api/auth', auth);
app.use('/api/onboarding', onboarding);
app.use('/api/spaces', space);
app.use('/api/search', search);
app.use('/api/exp', exp);
app.use('/api/reports', reports);
// app.use('/api/login', login);

module.exports = app;
