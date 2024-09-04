'use server';

import { prisma } from '@/lib/prisma';
import { Member, Photo } from '@prisma/client';
import { GetMemberParams, PaginatedResponse } from '@/types';
import { addYears } from 'date-fns';
import { getAuthUserId } from '@/app/actions/authActions';

// 42 (Fetching data from the Database using server actions)
// 121 (Adding the age slider functionality)
// 122 (Adding the sorting functionality)
// 124 (Adding the gender filter)
// 130 (Adding teh pagination functionality Part 2)

// Memberはプロフィール情報(gender, dateOfBrith, city, Photo[]など)を含むmodel
// getMembers()はserver側で実行されるserver action
// query stringを使うことで、server側でも状態の変化を検知して、それに基づいてmemberを取得できます。
export async function getMembers({
  // default values
  ageRange = '18,100',
  gender = 'male,female',
  orderBy = 'updated',
  pageNumber = '1',
  pageSize = '12',
}: GetMemberParams): Promise<PaginatedResponse<Member>> {
  const userId = await getAuthUserId();

  // split(',') を使うと [18,100] のようになります。
  const [minAge, maxAge] = ageRange.split(',');

  // データベースには年齢ではなく生年月日(DOB)を記録しているので、年齢ではなく生年月日を計算する必要があります。
  const currentDate = new Date();
  const minDob = addYears(currentDate, -maxAge - 1);
  const maxDob = addYears(currentDate, -minAge);

  // split(',') を使うと ['male', 'female'] のようになります。
  const selectedGender = gender.split(',');

  // 現在どのページにいるか
  const page = parseInt(pageNumber);
  // １ページ当たりのアイテム数
  const limit = parseInt(pageSize);

  // 何個アイテムをスキップするか =  １ページ当たりのアイテム数 * (現在のページ - 1)
  const skip = limit * (page - 1);

  try {
    const count = await prisma.member.count({
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
        // get members except for the loggedIn user
        NOT: {
          userId,
        },
      },
    });

    const members = await prisma.member.findMany({
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
        // get members except for the loggedIn user
        NOT: {
          userId,
        },
      },
      // [] (JavaScriptのComputed Property Names)を使うと、
      // オブジェクトのプロパティ名を動的に設定することができます。
      orderBy: { [orderBy]: 'desc' },
      skip,
      take: limit,
    });

    return {
      items: members,
      totalCount: count,
    };
  } catch (error) {
    console.log(error);
    throw error;
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
