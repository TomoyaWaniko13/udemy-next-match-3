'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// 42(Fetching data from the Database using server actions)
// Memberはプロフィール情報(gender, dateOfBrith, city, Photo[]など)を含むmodel
// getMembers()はserver側で実行されるserver action
export async function getMembers() {
  const session = await auth();
  if (!session?.user) return null;

  try {
    // get all members except for the longed in user
    return prisma.member.findMany({
      where: { NOT: { userId: session.user.id } },
    });
  } catch (error) {
    console.log(error);
  }
}

// 45 (Using dynamic routes in Next.js)
// userIdをもとに Memberを取得するserver action
export async function getMemberByUserId(userId: string) {
  try {
    return prisma.member.findUnique({ where: { userId } });
  } catch (error) {
    console.log(error);
  }
}
