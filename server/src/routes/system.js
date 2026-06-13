const express = require('express');
const { requireSystem } = require('../middleware/auth');
const { resetMonthlyConsumption } = require('../utils/cronJobs');

const router = express.Router();

// Manual monthly reset trigger
router.post('/monthly-reset', requireSystem, async (req, res) => {
  try {
    const result = await resetMonthlyConsumption();
    res.json({
      message: 'Monthly reset completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Manual monthly reset error:', error);
    res.status(500).json({ message: 'Monthly reset failed' });
  }
});

module.exports = router;