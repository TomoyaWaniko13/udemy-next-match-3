'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAuthUserId } from '@/app/actions/authActions';
import { pusherServer } from '@/lib/pusher';

// 54 (Adding the like toggle function)
// 116 (Challenge solution)
// isLiked の値に基づいて、いいねをつける(create method)、もしくはいいねを取り消す(delete method)。
export async function toggleLikeMember(targetUserId: string, isLiked: boolean) {
  try {
    // server action from authActions.ts
    const userId = await getAuthUserId();

    // いいねがすでにつけられていたら、いいねを取り消します。
    if (isLiked) {
      await prisma.like.delete({
        where: {
          sourceUserId_targetUserId: {
            sourceUserId: userId,
            targetUserId,
          },
        },
      });
      // いいねがまだつけられていなかったら、いいねをつけます。
      // さらに、いいねを押された人にtoastで通知するために、
      // いいねを押した人, つまりsourceMemberのpropertiesをselectで取得します。
    } else {
      const like = await prisma.like.create({
        data: {
          sourceUserId: userId,
          targetUserId,
        },
        select: {
          sourceMember: {
            select: {
              name: true,
              image: true,
              userId: true,
            },
          },
        },
      });

      // Pusherでいいねをされた人(targetUser)に向けて通知を送ります。
      // これはuseNotificationChannel()で監視されています。
      await pusherServer.trigger(`private-${targetUserId}`, 'like:new', {
        name: like.sourceMember.name,
        image: like.sourceMember.image,
        userId: like.sourceMember.userId,
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
    // SELECT target_user_id
    // FROM likes
    // WHERE source_user_id = :userId;
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
  // SELECT m.*
  // FROM likes l
  // JOIN members m ON l.target_user_id = m.user_id
  // WHERE l.source_user_id = :userId;
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
  // 現在のユーザー(source) => いいねをつけられたユーザーたち(target)のtargetを探しています。
  // => はいいねを表しています。
  const likedUsers = await prisma.like.findMany({
    where: {
      sourceUserId: userId,
    },
    select: {
      targetUserId: true,
    },
  });
  // その配列から、targetUserId のみを取得し、配列にします。
  const likeIds = likedUsers.map((x) => x.targetUserId);

  // 現在のユーザー(target) <= いいねをつけられたユーザーたち(source)のsourceを探しています。
  // <= はいいねを表しています。
  // sourceUserId: { in: likeIds }という部分は、「sourceUserId が likeIds 配列の中のいずれかの値と一致する」という条件を表しています。
  const mutualList = await prisma.like.findMany({
    where: {
      AND: [{ targetUserId: userId }, { sourceUserId: { in: likeIds } }],
    },
    select: { sourceMember: true },
  });

  return mutualList.map((x) => x.sourceMember);
}
