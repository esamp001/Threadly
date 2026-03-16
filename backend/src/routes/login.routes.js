// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const express = require('express');
// const router = express.Router();
// const db = require('../db/knex');

// In auth.routes.js

// TBA: FLOW FOR LOGIN
// 1. After social auth login
// 2. If first time go to onboarding
// 3. If not first time go to home
// 4. When user clicks profile there's a popup that shows to set for their password setup.
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   let userData = null;
//   let success = false;
//   let error = "";
//   let status = 200;
//   let token = null;
//   let user = null;

//   try {
//     user = await db('users').where({ email }).first();

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       status = 401;
//       error = 'Invalid credentials';
//       return; // Stop here, but do NOT send a response yet
//     }

//     token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
//     success = true;
//     userData = { ...user, password: null };

//   } catch (err) {
//     status = 500;
//     error = 'Internal Server Error';
//     console.error(err);
//   } finally {
//     res.status(status).json({
//       success,
//       error,
//       token,
//       userData,
//       isNewUser: false
//     });
//   }
// });