import { PrismaClient } from '@prisma/client';
import { membersData } from './membersData';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// 41 (Seeding data into the Database)
// 142 (Setting up tokens and resetting the Database)

async function seedMembers() {
  // membersData（テストデータ) をデータベースに記録します。
  // User modelは auth に関する情報
  // Member はプロフィールに関する情報
  // photos は Member が保持している写真
  return membersData.map(async (member) =>
    prisma.user.create({
      data: {
        email: member.email,
        name: member.name,
        emailVerified: new Date(),
        passwordHash: await hash('password', 12),
        image: member.image,
        profileComplete: true,
        member: {
          create: {
            dateOfBirth: new Date(member.dateOfBirth),
            gender: member.gender,
            name: member.name,
            created: new Date(member.created),
            updated: new Date(member.lastActive),
            description: member.description,
            city: member.city,
            country: member.country,
            image: member.image,
            photos: { create: { url: member.image, isApproved: true } },
          },
        },
      },
    }),
  );
}

async function seedAdmin() {
  return prisma.user.create({
    data: {
      email: 'admin@test.com',
      emailVerified: new Date(),
      passwordHash: await hash('password', 12),
      role: 'ADMIN',
    },
  });
}

async function main() {
  if (process.env.RUN_SEED === 'true' || process.env.NODE_ENV === 'development') {
    await seedMembers();
    await seedAdmin();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
