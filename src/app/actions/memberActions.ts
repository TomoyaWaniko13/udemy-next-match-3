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
// 135 (Challenge solution)

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
  withPhoto = 'true',
}: GetMemberParams): Promise<PaginatedResponse<Member>> {
  const userId = await getAuthUserId();

  // split(',') を使うと [18,100] のように配列になります。
  const [minAge, maxAge] = ageRange.split(',');

  // データベースには年齢ではなく生年月日(DOB)を記録しているので、年齢ではなく生年月日を計算する必要があります。
  const currentDate = new Date();
  const minDob = addYears(currentDate, -maxAge - 1);
  const maxDob = addYears(currentDate, -minAge);

  // split(',') を使うと ['male', 'female'] のように配列になります。
  const selectedGender = gender.split(',');

  // 現在どのページにいるか
  const page = parseInt(pageNumber);

  // １ページ当たりのアイテム数、つまり何個アイテムを取るかを表しています。
  const limit = parseInt(pageSize);

  // 何個アイテムをスキップするか =  １ページ当たりのアイテム数 * (現在のページ - 1)
  const skip = limit * (page - 1);

  let conditions: any[] = [
    { dateOfBirth: { gte: minDob } },
    { dateOfBirth: { lte: maxDob } },
    { gender: { in: selectedGender } },
  ];

  if (withPhoto === 'true') {
    conditions.push({ image: { not: null } });
  }

  try {
    const count = await prisma.member.count({
      where: {
        AND: conditions,
        // get members except for the loggedIn user
        NOT: { userId },
      },
    });

    const members = await prisma.member.findMany({
      where: {
        // gte = greater than or equal to, lte = less than or equal to
        AND: conditions,

        // get members except for the loggedIn user
        NOT: { userId },
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
// 161. Adding the photo moderation functionality part 1

// userId をもとに Member を取得する server action
export async function getMemberByUserId(userId: string) {
  try {
    return prisma.member.findUnique({ where: { userId } });
  } catch (error) {
    console.log(error);
  }
}

// 48 (Creating the Member detailed content)
// 66 (Displaying the images in the member edit component)

export async function getMemberPhotosByUserId(userId: string) {
  const currentUserId = await getAuthUserId();

  // Member の photos field だけを select します。
  const member = await prisma.member.findUnique({
    where: { userId },
    // 現在のユーザーの photos なら、 認証されていなくても表示できます。
    // 現在のユーザー以外の photos なら、認証されなければ表示されません。
    select: {
      photos: { where: currentUserId === userId ? {} : { isApproved: true } },
    },
  });

  if (!member) return null;

  return member.photos as Photo[];
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
