const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { requireAdmin } = require('../middleware/auth');
const { sendNotificationEmail } = require('../utils/emailService');

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get stock for admin's shop
router.get('/stock', async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({
      where: { shopId: req.admin.shopId },
      orderBy: { productName: 'asc' }
    });

    res.json(stocks);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ message: 'Failed to fetch stock' });
  }
});

// Add stock supply
router.post('/stock/supply', async (req, res) => {
  try {
    const { productName, quantity, unit } = req.body;

    if (!productName || !quantity || !unit) {
      return res.status(400).json({ message: 'Product name, quantity, and unit are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }

    const updatedStock = await prisma.stock.upsert({
      where: {
        shopId_productName: {
          shopId: req.admin.shopId,
          productName: productName
        }
      },
      update: {
        quantityAvailable: {
          increment: parseFloat(quantity)
        }
      },
      create: {
        shopId: req.admin.shopId,
        productName: productName,
        quantityAvailable: parseFloat(quantity),
        unit: unit
      }
    });

    res.json({
      message: 'Stock updated successfully',
      stock: updatedStock
    });
  } catch (error) {
    console.error('Add stock error:', error);
    res.status(500).json({ message: 'Failed to add stock' });
  }
});

// Distribute ration
router.post('/distribute', async (req, res) => {
  try {
    const { userId, productName, quantity } = req.body;

    if (!userId || !productName || !quantity) {
      return res.status(400).json({ message: 'User ID, product name, and quantity are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }

    // Get user and validate shop
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { shop: true }
    });

    if (!user || user.shopId !== req.admin.shopId) {
      return res.status(404).json({ message: 'User not found in your shop' });
    }

    // Get current stock
    const stock = await prisma.stock.findUnique({
      where: {
        shopId_productName: {
          shopId: req.admin.shopId,
          productName: productName
        }
      }
    });

    if (!stock || stock.quantityAvailable < quantity) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    // Check user quota
    const quotaField = `${productName.toLowerCase()}Quota`;
    const consumedField = `${productName.toLowerCase()}Consumed`;
    
    const currentConsumed = user[consumedField] || 0;
    const quota = user[quotaField] || 0;

    if (currentConsumed + quantity > quota) {
      return res.status(400).json({ 
        message: `Quota exceeded. Available: ${quota - currentConsumed}, Requested: ${quantity}` 
      });
    }

    // Perform transaction
    await prisma.$transaction(async (tx) => {
      // Update stock
      await tx.stock.update({
        where: {
          shopId_productName: {
            shopId: req.admin.shopId,
            productName: productName
          }
        },
        data: {
          quantityAvailable: {
            decrement: parseFloat(quantity)
          }
        }
      });

      // Update user consumption
      await tx.user.update({
        where: { id: userId },
        data: {
          [consumedField]: {
            increment: parseInt(quantity)
          }
        }
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: userId,
          shopId: req.admin.shopId,
          adminId: req.admin.id,
          productName: productName,
          quantity: parseFloat(quantity),
          unit: stock.unit
        }
      });
    });

    // ✅ ADD EMAIL NOTIFICATION HERE (after successful transaction)
    try {
      const productUnit = productName === 'KEROSENE' ? 'L' : 'kg';
      const emailMessage = `
        Dear ${user.name},<br><br>
        Your ration distribution has been successfully processed.<br>
        <strong>Product:</strong> ${productName}<br>
        <strong>Quantity:</strong> ${quantity} ${productUnit}<br>
        <strong>Date:</strong> ${new Date().toLocaleDateString()}<br><br>
        Thank you for using Ration Track System.
      `;

      await sendNotificationEmail(
        user.email,
        'Ration Distribution Update - Ration Track System',
        emailMessage
      );

      console.log(`Email notification sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the entire request if email fails
    }

    res.json({ message: 'Ration distributed successfully' });
  } catch (error) {
    console.error('Distribute ration error:', error);
    res.status(500).json({ message: 'Failed to distribute ration' });
  }
});

// Get transactions with optional date filter
router.get('/transactions', async (req, res) => {
  try {
    const { date } = req.query;
    let whereClause = { shopId: req.admin.shopId };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      whereClause.transactionDate = {
        gte: startDate,
        lt: endDate
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, rationCardNumber: true }
        },
        admin: {
          select: { fullName: true }
        }
      },
      orderBy: { transactionDate: 'desc' },
      take: 100
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// Get shop users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { shopId: req.admin.shopId },
      orderBy: { name: 'asc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Add new user
router.post('/users', async (req, res) => {
  try {
    const { rationCardNumber, name, email, riceQuota, wheatQuota, sugarQuota, keroseneQuota } = req.body;

    if (!rationCardNumber || !name || !email) {
      return res.status(400).json({ message: 'Ration card number, name, and email are required' });
    }

    const newUser = await prisma.user.create({
      data: {
        rationCardNumber,
        name,
        email,
        shopId: req.admin.shopId,
        riceQuota: riceQuota || 20,
        wheatQuota: wheatQuota || 10,
        sugarQuota: sugarQuota || 5,
        keroseneQuota: keroseneQuota || 3
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Ration card number already exists' });
    }
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, riceQuota, wheatQuota, sugarQuota, keroseneQuota } = req.body;

    const user = await prisma.user.findFirst({
      where: { id: id, shopId: req.admin.shopId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found in your shop' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(riceQuota !== undefined && { riceQuota }),
        ...(wheatQuota !== undefined && { wheatQuota }),
        ...(sugarQuota !== undefined && { sugarQuota }),
        ...(keroseneQuota !== undefined && { keroseneQuota })
      }
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: { id: id, shopId: req.admin.shopId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found in your shop' });
    }

    await prisma.user.delete({
      where: { id: id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;