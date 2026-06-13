const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create shops (upsert for idempotency)
  const shop1 = await prisma.shop.upsert({
    where: { shopName: 'Central Ration Shop - Sector 15' },
    update: {},
    create: {
      
      shopName: 'Central Ration Shop - Sector 15',
      location: 'Sector 15, Chandigarh',
    },
  });

  const shop2 = await prisma.shop.upsert({
    where: { shopName: 'Model Ration Shop - Model Town' },
    update: {},
    create: {
      
      shopName: 'Model Ration Shop - Model Town',
      location: 'Model Town, Delhi',
    },
  });

  // Create admins
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const admin1 = await prisma.admin.upsert({
    where: { username: 'admin1' },
    update: { passwordHash: hashedPassword },
    create: {
      username: 'admin1',
      passwordHash: hashedPassword,
      fullName: 'Rajesh Kumar',
      shopId: shop1.id,
    },
  });

  const admin2 = await prisma.admin.upsert({
    where: { username: 'admin2' },
    update: { passwordHash: hashedPassword },
    create: {
      username: 'admin2',
      passwordHash: hashedPassword,
      fullName: 'Priya Sharma',
      shopId: shop2.id,
    },
  });

  // Create users for shop 1
  const shop1Users = [
    { rationCardNumber: 'RC001', name: 'Amit Singh', email: 'amit@example.com' },
    { rationCardNumber: 'RC002', name: 'Sunita Devi', email: 'sunita@example.com' },
    { rationCardNumber: 'RC003', name: 'Ravi Gupta', email: 'ravi@example.com' },
    { rationCardNumber: 'RC004', name: 'Maya Patel', email: 'maya@example.com' },
  ];

  // Create users for shop 2
  const shop2Users = [
    { rationCardNumber: 'RC101', name: 'Deepak Yadav', email: 'deepak@example.com' },
    { rationCardNumber: 'RC102', name: 'Kavita Sharma', email: 'kavita@example.com' },
    { rationCardNumber: 'RC103', name: 'Suresh Kumar', email: 'suresh@example.com' },
    { rationCardNumber: 'RC104', name: 'Pooja Singh', email: 'pooja@example.com' },
    { rationCardNumber: 'RC105', name: 'Vikash Jain', email: 'vikash@example.com' },
  ];

  // Seed shop 1 users
  for (const userData of shop1Users) {
    await prisma.user.upsert({
      where: { rationCardNumber: userData.rationCardNumber },
      update: {},
      create: {
        ...userData,
        shopId: shop1.id,
        riceQuota: 20,
        wheatQuota: 10,
        sugarQuota: 5,
        keroseneQuota: 3,
      },
    });
  }

  // Seed shop 2 users
  for (const userData of shop2Users) {
    await prisma.user.upsert({
      where: { rationCardNumber: userData.rationCardNumber },
      update: {},
      create: {
        ...userData,
        shopId: shop2.id,
        riceQuota: 20,
        wheatQuota: 10,
        sugarQuota: 5,
        keroseneQuota: 3,
      },
    });
  }

  // Create stock for shop 1
  const shop1Stocks = [
    { productName: 'RICE', quantityAvailable: 500, unit: 'kg' },
    { productName: 'WHEAT', quantityAvailable: 300, unit: 'kg' },
    { productName: 'SUGAR', quantityAvailable: 150, unit: 'kg' },
    { productName: 'KEROSENE', quantityAvailable: 100, unit: 'L' },
  ];

  // Create stock for shop 2
  const shop2Stocks = [
    { productName: 'RICE', quantityAvailable: 400, unit: 'kg' },
    { productName: 'WHEAT', quantityAvailable: 250, unit: 'kg' },
    { productName: 'SUGAR', quantityAvailable: 0, unit: 'kg' },
    { productName: 'KEROSENE', quantityAvailable: 80, unit: 'L' },
  ];

  // Seed shop 1 stocks
  for (const stockData of shop1Stocks) {
    await prisma.stock.upsert({
      where: {
        shopId_productName: {
          shopId: shop1.id,
          productName: stockData.productName,
        },
      },
      update: { quantityAvailable: stockData.quantityAvailable },
      create: {
        ...stockData,
        shopId: shop1.id,
      },
    });
  }

  // Seed shop 2 stocks
  for (const stockData of shop2Stocks) {
    await prisma.stock.upsert({
      where: {
        shopId_productName: {
          shopId: shop2.id,
          productName: stockData.productName,
        },
      },
      update: { quantityAvailable: stockData.quantityAvailable },
      create: {
        ...stockData,
        shopId: shop2.id,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });