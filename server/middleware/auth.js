const jwt = require('jsonwebtoken');
const WhitelistedToken = require('../schemas/WhitelistedToken'); // Import new model

module.exports = function (req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    // Check if token is in whitelist and not expired
    WhitelistedToken.findOne({ token: token })
      .then(whitelistedToken => {
        if (!whitelistedToken) return res.status(401).json({ message: 'Invalid token, authorization denied' });
        next();
      })
      .catch(err => res.status(500).json({ message: 'Server error during token validation' }));
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};