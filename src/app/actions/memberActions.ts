'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Photo } from '@prisma/client';
import { UserFilters } from '@/types';
import { addYears } from 'date-fns';
import { getAuthUserId } from '@/app/actions/authActions';
import { linkGc } from 'next/dist/client/app-link-gc';

// 42 (Fetching data from the Database using server actions)
// 121 (Adding the age slider functionality)
// 122 (Adding the sorting functionality)
// 124 (Adding the gender filter)
// Memberはプロフィール情報(gender, dateOfBrith, city, Photo[]など)を含むmodel
// getMembers()はserver側で実行されるserver action
// query stringを使うことで、server側でも状態の変化を検知して、それに基づいてmemberを取得できます。
export async function getMembers(searchParams: UserFilters) {
  // searchParamsは、  { ageRange: '25,81', gender: ',male,female', orderBy: 'created' }　などです。

  const session = await auth();
  if (!session?.user) return null;

  // 121 (Adding the age slider functionality)
  // [25,81] というふうに変換されます。
  const ageRange = searchParams?.ageRange?.toString()?.split(',') || [18, 100];
  // データベースには年齢ではなく生年月日(DOB)を記録しているので、年齢ではなく生年月日を計算する必要があります。
  const currentDate = new Date();
  const minDob = addYears(currentDate, -ageRange[1] - 1);
  const maxDob = addYears(currentDate, -ageRange[0]);

  // 122 (Adding the sorting functionality)
  // 'created' というふうに変換されます。
  const orderBySelector = searchParams?.orderBy || 'updated';

  // [ '', 'female', 'male' ] というふうに変換されます。
  const selectedGender = searchParams?.gender?.toString()?.split(',') || ['male', 'female'];

  try {
    // get all members except for the loggedIn user
    return prisma.member.findMany({
      where: {
        // gte = greater than or equal to, lte = less than or equal to
        AND: [
          // 121 (Adding the age slider functionality)
          { dateOfBirth: { gte: minDob } },
          { dateOfBirth: { lte: maxDob } },
          // gender: { in: selectedGender }という部分は、
          // 「gender が selectedGender 配列の中のいずれかの値と一致する」という条件を表しています。
          { gender: { in: selectedGender } },
        ],
        NOT: { userId: session.user.id },
      },
      // [] (JavaScriptのComputed Property Names)を使うと、
      // オブジェクトのプロパティ名を動的に設定することができます。
      orderBy: { [orderBySelector]: 'desc' },
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

// 123 (Updating the last active property)
export async function updateLastActive() {
  const userId = await getAuthUserId();

  try {
    return prisma.member.update({
      where: { userId },
      data: { updated: new Date() },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
