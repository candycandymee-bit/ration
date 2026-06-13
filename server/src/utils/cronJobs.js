const prisma = require('../config/database');

const resetMonthlyConsumption = async () => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    
    const result = await prisma.user.updateMany({
      data: {
        riceConsumed: 0,
        wheatConsumed: 0,
        sugarConsumed: 0,
        keroseneConsumed: 0,
        lastResetMonth: currentMonth
      }
    });

    console.log(`Monthly reset completed. Updated ${result.count} users.`);
    
    return {
      resetDate: new Date().toISOString(),
      usersReset: result.count,
      month: currentMonth
    };
  } catch (error) {
    console.error('Monthly reset failed:', error);
    throw error;
  }
};

module.exports = {
  resetMonthlyConsumption
};