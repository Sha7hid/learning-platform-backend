const jwt = require('jsonwebtoken');

function authenticateJwt(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Missing Authorization token' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { authenticateJwt };


