import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { UserStatus } from '../generated/prisma/enums';
import { RoleName } from '../src/shared/constants/role.constants';
import { HashingService } from '../src/shared/hashing/hashing.service';
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });
const hashingService = new HashingService();
const saltRounds = 10;

function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

async function seedRoles() {
  const roleCount = await prisma.role.count();

  if (roleCount > 0) {
    console.log('Roles already exist. Skipping seeding.');
    return;
  }

  await prisma.role.createMany({
    data: [
      {
        name: RoleName.ADMIN,
        description: 'Role ADMIN',
      },
      {
        name: RoleName.USER,
        description: 'Role USER',
      },
      {
        name: RoleName.SELLER,
        description: 'Role SELLER',
      },
    ],
  });

  console.log('Roles seeded successfully.');
}

async function seedAdminUser() {
  const roleAdmin = await prisma.role.findFirstOrThrow({
    where: { name: RoleName.ADMIN },
  });

  const email = getRequiredEnv('ADMIN_EMAIL');
  const password = getRequiredEnv('ADMIN_PASSWORD');
  const name = getRequiredEnv('ADMIN_NAME');
  const phoneNumber = getRequiredEnv('ADMIN_PHONE_NUMBER');
  const hashedPassword = await hashingService.hash(password);

  const existingAdmin = await prisma.user.findFirst({
    where: { email },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        name,
        password: hashedPassword,
        phoneNumber,
        status: UserStatus.ACTIVE,
        roleId: roleAdmin.id,
      },
    });

    console.log('Admin user already exists. Updated admin user.');
    return;
  }

  const adminUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      status: UserStatus.ACTIVE,
      roleId: roleAdmin.id,
    },
  });

  console.log('Admin user seeded successfully:', adminUser.email);
}

async function main() {
  await seedRoles();
  await seedAdminUser();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
