import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial admin account...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'pandit@astro.com' }
  });

  if (existingAdmin) {
    console.log('Admin account already exists in the database.');
    return;
  }

  // Hash the password securely
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create the user
  const admin = await prisma.user.create({
    data: {
      email: 'pandit@astro.com',
      name: 'Head Pandit',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log(`✅ Admin account created successfully!`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error('Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
