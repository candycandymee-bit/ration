const express = require('express');
const prisma = require('../config/database');
const { requireUser } = require('../middleware/auth');

const router = express.Router();

// Apply user middleware to all routes
router.use(requireUser);

// Get user dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const user = req.user;
    
    // Get shop stock
    const shopStock = await prisma.stock.findMany({
      where: { shopId: user.shopId },
      orderBy: { productName: 'asc' }
    });

    // Get recent transactions (last 10)
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        admin: {
          select: { fullName: true }
        }
      },
      orderBy: { transactionDate: 'desc' },
      take: 10
    });

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        rationCardNumber: user.rationCardNumber,
        email: user.email,
        quotas: {
          rice: { quota: user.riceQuota, consumed: user.riceConsumed },
          wheat: { quota: user.wheatQuota, consumed: user.wheatConsumed },
          sugar: { quota: user.sugarQuota, consumed: user.sugarConsumed },
          kerosene: { quota: user.keroseneQuota, consumed: user.keroseneConsumed }
        },
        shop: user.shop
      },
      shopStock,
      recentTransactions
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Get current shop stock
router.get('/stock', async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({
      where: { shopId: req.user.shopId },
      orderBy: { productName: 'asc' }
    });

    res.json(stocks);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ message: 'Failed to fetch stock' });
  }
});

module.exports = router;