import { PrismaClient } from '@prisma/client';

/**
 * Test database connection for production deployment
 * Usage: pnpm tsx src/test-connection.ts
 */

const prisma = new PrismaClient();

async function testConnection() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔌 Testing Database Connection');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    console.log('📡 Attempting to connect to database...');
    console.log(`   Database URL: ${process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'Not set'}\n`);

    // Test basic connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as connection_test`;
    console.log('✅ Database connection successful!\n');

    // Get database info
    console.log('📊 Database Information:');
    console.log('─────────────────────────────────────────');
    
    const userCount = await prisma.user.count();
    console.log(`   Total Users: ${userCount}`);
    
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    console.log(`   Admin Users: ${adminCount}`);
    
    const transactionCount = await prisma.transaction.count();
    console.log(`   Transactions: ${transactionCount}`);
    
    const cardCount = await prisma.virtualCard.count();
    console.log(`   Virtual Cards: ${cardCount}`);
    
    const refundCount = await prisma.refundRequest.count();
    console.log(`   Refund Requests: ${refundCount}`);
    
    console.log('─────────────────────────────────────────\n');

    // Check if admin exists
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { email: true, firstName: true, lastName: true },
    });

    if (admin) {
      console.log('👤 Admin Account Found:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.firstName} ${admin.lastName}\n`);
    } else {
      console.log('⚠️  No admin account found!\n');
      console.log('   Run the seed script to create an admin:');
      console.log('   pnpm tsx src/seed-production.ts\n');
    }

    // Test query performance
    console.log('⚡ Performance Test:');
    const startTime = Date.now();
    await prisma.user.findMany({ take: 10 });
    const queryTime = Date.now() - startTime;
    console.log(`   Query time (10 users): ${queryTime}ms`);
    
    if (queryTime > 1000) {
      console.log('   ⚠️  Query is slow! Check database indexes and connection.\n');
    } else {
      console.log('   ✅ Query performance is good.\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All tests passed! Database is ready for production.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed!\n');
    console.error('Error details:');
    console.error(`   Message: ${error.message}\n`);
    
    if (error.message.includes('P1001')) {
      console.error('💡 Troubleshooting:');
      console.error('   - Check if DATABASE_URL is set correctly');
      console.error('   - Verify the database server is running');
      console.error('   - Check firewall rules allow connections\n');
    } else if (error.message.includes('P1003')) {
      console.error('💡 Troubleshooting:');
      console.error('   - Database does not exist');
      console.error('   - Create the database or check DATABASE_URL\n');
    } else if (error.message.includes('SSL')) {
      console.error('💡 Troubleshooting:');
      console.error('   - Add ?sslmode=require to DATABASE_URL');
      console.error('   - Most cloud providers require SSL connections\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
