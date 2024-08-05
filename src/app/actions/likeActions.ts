'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAuthUserId } from '@/app/actions/authActions';

// 54 (Adding the like toggle function)
// isLikedの値に基づいて、いいねをつける(create() method)、もしくはいいねを取り消す(delete() method)。
export async function toggleLikeMember(targetUserId: string, isLiked: boolean) {
  try {
    // from authActions.ts
    const userId = await getAuthUserId();

    if (!userId) throw new Error('Unauthorized');

    if (isLiked) {
      await prisma.like.delete({
        where: { sourceUserId_targetUserId: { sourceUserId: userId, targetUserId } },
      });
    } else {
      await prisma.like.create({
        data: { sourceUserId: userId, targetUserId },
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 54 (Adding the like toggle function)
export async function fetchCurrentUserLikeIds() {
  try {
    // from authActions.ts
    const userId = await getAuthUserId();

    // loginしているユーザーがいいねしたユーザーのid(targetUserId)だけをselectする。
    const likeIds = await prisma.like.findMany({
      where: { sourceUserId: userId },
      select: { targetUserId: true },
    });

    // likeIds objectの targetUserId配列を抽出する。
    return likeIds.map((like) => like.targetUserId);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
