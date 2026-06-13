const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
      include: { shop: true }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: admin.id, 
        type: 'admin',
        shopId: admin.shopId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        shop: admin.shop
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// User login
router.post('/user/login', async (req, res) => {
  try {
    const { rationCardNumber } = req.body;

    if (!rationCardNumber) {
      return res.status(400).json({ message: 'Ration card number is required' });
    }

    const user = await prisma.user.findUnique({
      where: { rationCardNumber },
      include: { shop: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Ration card not found' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        type: 'user',
        shopId: user.shopId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        rationCardNumber: user.rationCardNumber,
        name: user.name,
        email: user.email,
        shop: user.shop
      },
      token
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;