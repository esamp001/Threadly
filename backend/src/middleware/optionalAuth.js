const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    // No auth header, continue without user info
    return next();
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    // No token, continue without user info
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Invalid token, continue without user info
      return next();
    }

    req.user = user;
    req.token = token;
    next();
  });
};

module.exports = { optionalAuth };
