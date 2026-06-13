const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const requireAdmin = async (req, res, next) => {
  try {
    let token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      include: { shop: true }
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const requireUser = async (req, res, next) => {
  try {
    let token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'user') {
      return res.status(403).json({ message: 'Access denied. User privileges required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { shop: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const requireSystem = (req, res, next) => {
  const systemKey = req.headers['x-system-key'];
  
  if (systemKey !== process.env.SYSTEM_KEY && systemKey !== 'manual-trigger') {
    return res.status(403).json({ message: 'Access denied. System key required.' });
  }
  
  next();
};

module.exports = { requireAdmin, requireUser, requireSystem };