'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Photo } from '@prisma/client';
import { UserFilters } from '@/types';
import { addYears } from 'date-fns';

// 42 (Fetching data from the Database using server actions)
// 121 (Adding the age slider functionality)

// Memberはプロフィール情報(gender, dateOfBrith, city, Photo[]など)を含むmodel
// getMembers()はserver側で実行されるserver action
// query stringを使うことで、server側でも状態の変化を検知して、それに基づいてmemberを取得できます。
export async function getMembers(searchParams: UserFilters) {
  const session = await auth();
  if (!session?.user) return null;

  const ageRange = searchParams?.ageRange?.toString()?.split(',') || [18, 100];
  // データベースには年齢ではなく生年月日(DOB)を記録しているので、年齢ではなく生年月日を計算する必要があります。
  const currentDate = new Date();
  const minDob = addYears(currentDate, -ageRange[1] - 1);
  const maxDob = addYears(currentDate, -ageRange[0]);

  try {
    // get all members except for the loggedIn user
    return prisma.member.findMany({
      where: {
        // gte = greater than or equal to, lte = less than or equal to
        AND: [{ dateOfBirth: { gte: minDob } }, { dateOfBirth: { lte: maxDob } }],
        NOT: { userId: session.user.id },
      },
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
// 66 (Displaying the images in the member edit component)
// userIdをもとにMemberのPhotosを取得するserver action
export async function getMemberPhotosByUserId(userId: string) {
  // Memberのphotoだけをselectする。
  const member = await prisma.member.findUnique({
    where: { userId },
    select: { photo: true },
  });

  if (!member) return null;

  // member objectの photo配列を抽出する。
  return member.photo.map((p) => p) as Photo[];
}
