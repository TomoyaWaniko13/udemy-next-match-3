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
    // DELETE FROM likes
    // WHERE source_user_id = :userId AND target_user_id = :targetUserId;
    if (isLiked) {
      await prisma.like.delete({
        where: {
          sourceUserId_targetUserId: {
            sourceUserId: userId,
            targetUserId,
          },
        },
      });
      //  いいねがまだつけられていなかったら、いいねをつけます。
      //  さらに、いいねを押された人にtoastで通知するために、いいねを押した人のpropertiesをselectで取得します。
    } else {
      // INSERT INTO likes (source_user_id, target_user_id)
      // VALUES (:userId, :targetUserId)
      // RETURNING (
      //     SELECT json_build_object(
      //         'name', m.name,
      //         'image', m.image,
      //         'userId', m.user_id
      //     )
      //     FROM members m
      //     WHERE m.user_id = :userId
      // ) AS source_member;
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
  // WITH liked_users AS (
  //     SELECT target_user_id
  //     FROM likes
  //     WHERE source_user_id = :userId
  // )
  // SELECT m.*
  // FROM likes l
  // JOIN members m ON l.source_user_id = m.user_id
  // WHERE l.target_user_id = :userId
  //   AND l.source_user_id IN (SELECT target_user_id FROM liked_users);

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
    where: {
      AND: [{ targetUserId: userId }, { sourceUserId: { in: likeIds } }],
    },
    select: { sourceMember: true },
  });

  return mutualList.map((x) => x.sourceMember);
}
