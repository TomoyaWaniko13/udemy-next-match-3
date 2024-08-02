import { PrismaClient } from '@prisma/client';
import { membersData } from './membersData';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// 41 (Seeding data into the Database)
async function seedMembers() {
  // membersData（テストデータ)を databaseにinsertする。
  // User modelは authに関する情報
  // Memberはプロフィールに関する情報
  // photosはMemberが保持している写真
  return membersData.map(async (member) =>
    prisma.user.create({
      data: {
        email: member.email,
        name: member.name,
        emailVertified: new Date(),
        passwordHash: await hash('password', 12),
        image: member.image,
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
            photo: { create: { url: member.image } },
          },
        },
      },
    }),
  );
}

async function main() {
  await seedMembers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
