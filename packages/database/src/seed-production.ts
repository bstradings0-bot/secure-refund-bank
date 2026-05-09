import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedProduction() {
  console.log('🌱 Seeding production database...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL || 'admin@securebank.com' },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists, skipping...\n');
    } else {
      // Create admin user
      const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12);
      await prisma.user.create({
        data: {
          email: process.env.ADMIN_EMAIL || 'admin@securebank.com',
          password: adminPassword,
          firstName: 'System',
          lastName: 'Administrator',
          role: 'ADMIN',
          emailVerified: true,
          phone: null,
          country: 'US',
        },
      });

      console.log('✅ Admin user created successfully');
      console.log(` Email: ${process.env.ADMIN_EMAIL || 'admin@securebank.com'}`);
      console.log(`🔐 Password: ${process.env.ADMIN_PASSWORD || 'Admin123!'}\n`);
    }

    // Optional: Create demo users only in non-production environments
    if (process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_DATA === 'true') {
      console.log('👥 Creating demo users...');
      
      const demoPassword = await bcrypt.hash('Demo1234!', 12);
      const demoUsers = [
        {
          email: 'sarah.johnson@email.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          country: 'US',
        },
        {
          email: 'michael.chen@email.com',
          firstName: 'Michael',
          lastName: 'Chen',
          country: 'CA',
        },
        {
          email: 'emma.williams@email.com',
          firstName: 'Emma',
          lastName: 'Williams',
          country: 'GB',
        },
      ];

      for (const userData of demoUsers) {
        const existing = await prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (!existing) {
          await prisma.user.create({
            data: {
              ...userData,
              password: demoPassword,
              role: 'USER',
              emailVerified: true,
              phone: null,
            },
          });
          console.log(`  ✅ Created: ${userData.email}`);
        } else {
          console.log(`  ⚠️  Skipped: ${userData.email} (exists)`);
        }
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Production database seeding complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (process.env.NODE_ENV === 'production') {
      console.log('🔒 Production mode: Only admin user created');
    } else {
      console.log('🧪 Development mode: Admin + demo users created');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProduction()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
