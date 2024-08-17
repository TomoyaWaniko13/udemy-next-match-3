'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAuthUserId } from '@/app/actions/authActions';

// 54 (Adding the like toggle function)
// isLikedの値に基づいて、いいねをつける(create() method)、もしくはいいねを取り消す(delete() method)。
export async function toggleLikeMember(targetUserId: string, isLiked: boolean) {
  try {
    // server action from authActions.ts
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
    // server action from authActions.ts
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

// 57 (Adding the list actions)
// 'source' は ログインしているuserのこと。 つまり type = 'source' なら　ログインしているuserがいいねをしたMemberを取得する。
// 'target' は　ログインしているuserにいいねをつけたほかのuserのこと。つまり、type = 'target'　なら　ログインしているuserをいいねをしたMemberを取得する。
export async function fetchLikedMembers(type = 'source') {
  try {
    // server action from authActions.ts
    const userId = await getAuthUserId();

    switch (type) {
      case 'source':
        return await fetchSourceLikes(userId);
      case 'target':
        return await fetchTargetLikes(userId);
      case 'mutual':
        return await fetchMutualLikes(userId);
      default:
        return [];
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 57 (Adding the list actions)
async function fetchSourceLikes(userId: string) {
  const sourceList = await prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetMember: true },
  });

  // sourceList objectの targetMember配列を抽出する。
  return sourceList.map((x) => x.targetMember);
}

// 57 (Adding the list actions)
async function fetchTargetLikes(userId: string) {
  const targetList = await prisma.like.findMany({
    where: { targetUserId: userId },
    select: { sourceMember: true },
  });

  // targetList objectの sourceMember配列を抽出する。
  return targetList.map((x) => x.sourceMember);
}

// 57 (Adding the list actions)
async function fetchMutualLikes(userId: string) {
  // ログインしているuserがいいねをしたuserのid(= targetUserId)を取得する。
  const likedUsers = await prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetUserId: true },
  });
  const likeIds = likedUsers.map((x) => x.targetUserId);

  // sourceUserId: { in: likeIds }という部分は、「sourceUserIdがlikeIds配列の中のいずれかの値と一致する」という条件を表しています。
  // ログインしているuserのidをtargetUserIdとして、
  // ログインしているuserがいいねをしたuserのidをsourceUserIdとする。
  // そうすることで、ログインしているuserがいいねをして、尚且つログインしているuserに対していいねをしたuserを取得できる。
  const mutualList = await prisma.like.findMany({
    where: { AND: [{ targetUserId: userId }, { sourceUserId: { in: likeIds } }] },
    select: { sourceMember: true },
  });

  return mutualList.map((x) => x.sourceMember);
}
