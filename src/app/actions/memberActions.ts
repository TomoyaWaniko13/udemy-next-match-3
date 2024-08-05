'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Photo } from '@prisma/client';

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

// 48 (Creating the Member detailed content)
// userIdをもとにMemberのPhotosを取得するserver action
export async function getMemberPhotosByUserId(userId: string) {
  // Memberのphotoだけをとってくる。
  const member = await prisma.member.findUnique({
    where: { userId },
    select: { photo: true },
  });

  if (!member) return null;

  // member objectの photo配列を抽出する。
  return member.photo.map((p) => p) as Photo[];
}
