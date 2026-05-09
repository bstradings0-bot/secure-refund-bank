import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean database
  await prisma.feeRecord.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.complianceLog.deleteMany();
  await prisma.kycDocument.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.refundRequest.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.virtualCard.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Demo1234!', 12);
  const adminPassword = await bcrypt.hash('Admin123!', 12);

  // Helper
  const ref = () => `SRB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const acctNum = () => `SRB${String(Math.floor(10000000 + Math.random() * 90000000))}`;

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@securebank.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'SecureRefund',
      phone: '+1-555-000-0000',
      country: 'US',
      role: 'ADMIN',
      emailVerified: true,
      kycStatus: 'APPROVED',
      kycVerifiedAt: new Date(),
      riskScore: 0,
      amlChecked: true,
      amlCheckedAt: new Date(),
      account: {
        create: {
          accountNumber: acctNum(),
          balance: 0.00,
          savingsBalance: 0.00,
          currency: 'USD',
          status: 'ACTIVE',
        },
      },
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Demo users with countries (production — zero starting balances)
  const users = [
    { email: 'sarah.johnson@email.com', firstName: 'Sarah', lastName: 'Johnson', phone: '+1-555-111-0001', country: 'US' },
    { email: 'michael.chen@email.com', firstName: 'Michael', lastName: 'Chen', phone: '+1-555-222-0002', country: 'CA' },
    { email: 'emma.williams@email.com', firstName: 'Emma', lastName: 'Williams', phone: '+44-7700-900001', country: 'GB' },
    { email: 'james.brown@email.com', firstName: 'James', lastName: 'Brown', phone: '+61-400-000-002', country: 'AU' },
    { email: 'olivia.davis@email.com', firstName: 'Olivia', lastName: 'Davis', phone: '+49-170-0000003', country: 'DE' },
  ];

  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        password: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        country: u.country,
        role: 'USER',
        emailVerified: true,
        kycStatus: 'APPROVED',
        kycVerifiedAt: new Date(),
        riskScore: 0,
        amlChecked: true,
        amlCheckedAt: new Date(),
        account: {
          create: {
            accountNumber: acctNum(),
            balance: 0.00,
            savingsBalance: 0.00,
            currency: 'USD',
            status: 'ACTIVE',
          },
        },
      },
    });
    createdUsers.push(user);
    console.log(`✅ User created: ${user.email} (${u.country})`);
  }

  // Virtual cards
  const cardThemes = ['blue', 'purple', 'gold', 'black', 'red'];
  for (const user of createdUsers) {
    const account = await prisma.account.findUnique({ where: { userId: user.id } });
    if (!account) continue;
    const cardCount = Math.random() > 0.5 ? 2 : 1;
    for (let i = 0; i < cardCount; i++) {
      const cardTypes: string[] = ['VISA', 'MASTERCARD', 'PREMIUM'];
      const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
      const cardNumber = `4${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const cvv = `${Math.floor(100 + Math.random() * 900)}`;
      const expiryMonth = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
      const expiryYear = (new Date().getFullYear() + Math.floor(2 + Math.random() * 4)).toString().slice(2);

      await prisma.virtualCard.create({
        data: {
          accountId: account.id,
          userId: user.id,
          cardType,
          cardNumber,
          cvv,
          expiryDate: `${expiryMonth}/${expiryYear}`,
          cardholderName: `${user.firstName} ${user.lastName}`,
          status: 'ACTIVE',
          spendingLimit: Math.floor(5000 + Math.random() * 15000),
          colorTheme: cardThemes[Math.floor(Math.random() * cardThemes.length)],
        },
      });
    }
  }
  console.log('✅ Virtual cards created');

  // Transactions
  const allUsers = createdUsers;
  for (let i = 0; i < 10; i++) {
    const sender = allUsers[Math.floor(Math.random() * allUsers.length)];
    let receiver = allUsers[Math.floor(Math.random() * allUsers.length)];
    while (receiver.id === sender.id) receiver = allUsers[Math.floor(Math.random() * allUsers.length)];

    const amount = parseFloat((Math.random() * 500 + 10).toFixed(2));
    const types: string[] = ['INTERNAL', 'BANK', 'SWIFT', 'CRYPTO', 'MOBILE'];
    const txType = types[Math.floor(Math.random() * types.length)];
    const descriptions = ['Consulting services', 'Freelance payment', 'Invoice #INV-' + Math.floor(1000 + Math.random() * 9000), 'Subscription renewal', 'Transfer to friend'];

    await prisma.transaction.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        amount,
        currency: 'USD',
        type: txType,
        status: i < 8 ? 'COMPLETED' : 'PENDING',
        referenceNumber: ref(),
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)),
      },
    });
  }
  console.log('✅ Transactions created');

  // Refund requests (2 sample pending refunds)
  const txns = await prisma.transaction.findMany({ where: { status: 'COMPLETED' }, take: 2 });
  for (const tx of txns) {
    await prisma.refundRequest.create({
      data: {
        transactionId: tx.id,
        userId: tx.receiverId,
        amount: tx.amount,
        reason: ['Duplicate charge', 'Service not rendered', 'Wrong amount charged'][Math.floor(Math.random() * 3)],
        status: 'PENDING',
      },
    });
  }
  console.log('✅ Sample refund requests created');

  // Notifications
  const notificationData = [
    { title: 'Welcome to SecureRefund Bank', message: 'Your account has been successfully created. Enjoy premium banking!', type: 'SYSTEM' as const },
    { title: 'Security Alert', message: 'New login detected from Chrome on Windows.', type: 'SECURITY' as const },
    { title: 'Virtual Card Ready', message: 'Your new virtual card has been issued and is ready to use.', type: 'CARD' as const },
  ];
  for (const user of allUsers) {
    for (const n of notificationData) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: n.title,
          message: n.message,
          type: n.type,
          read: Math.random() > 0.5,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        },
      });
    }
  }
  console.log('✅ Notifications created');

  // Activity logs
  for (const user of allUsers) {
    await prisma.activityLog.create({
      data: { userId: user.id, action: 'ACCOUNT_CREATED', createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) },
    });
    await prisma.activityLog.create({
      data: { userId: user.id, action: 'LOGIN', ipAddress: '192.168.1.1', userAgent: 'Chrome/120.0', createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) },
    });
  }
  console.log('✅ Activity logs created');

  // Announcements
  await prisma.announcement.create({
    data: {
      title: 'Welcome to SecureRefund',
      content: 'SecureRefund is a financial services platform providing digital wallets, payment processing, and international transfers via Stripe, Plaid, and Wise. Complete your KYC verification to unlock all features. This platform does NOT operate as a licensed bank.',
      priority: 'HIGH',
      active: true,
      createdBy: admin.id,
    },
  });
  await prisma.announcement.create({
    data: {
      title: 'New Feature: Refund Center',
      content: 'You can now submit and track refund requests directly from your dashboard. Our admin team processes refunds within 24-48 hours.',
      priority: 'NORMAL',
      active: true,
      createdBy: admin.id,
    },
  });
  console.log('✅ Announcements created');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌱 SEED COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 Admin login:  admin@securebank.com / Admin123!');
  console.log('👤 Demo user:    sarah.johnson@email.com / Demo1234!');
  console.log('   (All 5 demo users use password: Demo1234!)');
  console.log('');
  console.log('⚠️  SecureRefund is a fintech platform, not a licensed bank.');
  console.log('   To enable real payments, set STRIPE_SECRET_KEY, PLAID_CLIENT_ID,');
  console.log('   PLAID_SECRET, and WISE_API_KEY in your .env file.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
