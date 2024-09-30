'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from '@/app/actions/authActions';
import { pusherServer } from '@/lib/pusher';

// 54 (Adding the like toggle function)
// 116 (Challenge solution)

// isLiked の値に基づいて、targetUser に対してのいいねをつける、もしくはいいねを取り消します。
export async function toggleLikeMember(targetUserId: string, isLiked: boolean): Promise<void> {
  try {
    const userId = await getAuthUserId();

    // すでに現在のユーザーが targetUser に対していいねをしていたら、いいねを取り消します。
    if (isLiked) {
      await prisma.like.delete({
        where: {
          sourceUserId_targetUserId: {
            // From the current user
            sourceUserId: userId,
            // To the target user
            targetUserId,
          },
        },
      });
      //
      // 現在のユーザーが targetUser に対していいねをしていなかったら、いいねを追加します。
      // さらに、targetUser に toast で通知するために、
      // いいねを押した人、 つまり現在のユーザーの properties を select で取得します。
    } else {
      const newLike = await prisma.like.create({
        data: {
          // Form the current user
          sourceUserId: userId,
          // To the target user
          targetUserId,
        },
        select: { sourceMember: { select: { name: true, image: true, userId: true } } },
      });

      // Pusherで, いいねをされた人 (targetUser) に向けて通知を送ります。
      // これは useNotificationChannel() で監視されています。
      await pusherServer.trigger(`private-${targetUserId}`, 'like:new', {
        name: newLike.sourceMember.name,
        image: newLike.sourceMember.image,
        userId: newLike.sourceMember.userId,
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 54 (Adding the like toggle function)
// 現在のユーザーがいいねをした相手(targetUser)の ID 配列を返却します。
export async function fetchCurrentUserLikeIds(): Promise<string[]> {
  try {
    const userId = await getAuthUserId();

    // likeIds は 各要素がオブジェクト { targetUserId: string } の配列です。
    const likeIds: { targetUserId: string }[] = await prisma.like.findMany({
      where: { sourceUserId: userId },
      select: { targetUserId: true },
    });

    // like は likeIds 配列の各要素のオブジェクトを表します。
    return likeIds.map((like: { targetUserId: string }) => like.targetUserId);
    //
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 57 (Adding the list actions)
// 引数の query parameter の値により、return する users の IDs の配列を変更します。
export async function fetchLikedMembers(type = 'source') {
  try {
    const userId = await getAuthUserId();

    switch (type) {
      // これらの関数は下で定義されています。
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

// 現在のユーザーがいいねした member objects を配列として返却します。
async function fetchSourceLikes(userId: string) {
  // sourceList は 各要素がオブジェクトの配列です。
  const sourceList = await prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetMember: true },
  });

  // x は sourceList 配列の各要素のオブジェクトを表します。
  return sourceList.map((x) => x.targetMember);
}

// 57 (Adding the list actions)

// 現在のユーザーに対していいねをした members を配列として return します。
async function fetchTargetLikes(userId: string) {
  //
  const targetList = await prisma.like.findMany({
    where: { targetUserId: userId },
    select: { sourceMember: true },
  });

  // x は targetList 配列の各要素のオブジェクトを表します。
  return targetList.map((x) => x.sourceMember);
}

// 57 (Adding the list actions)
async function fetchMutualLikes(userId: string) {
  // 現在のユーザー(source) => いいねをつけられたユーザーたち(target) の target側を探しています。
  // => はいいねを表しています。
  const likedUsers = await prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetUserId: true },
  });

  // その配列から、targetUserId:string のみを取得し、配列にします。
  const likedUsersIds = likedUsers.map((x) => x.targetUserId);

  // 現在のユーザー(target) <= いいねをつけられたユーザーたち(source)の source側を探しています。
  // <= はいいねを表しています。
  // sourceUserId: { in: likedUsersIds }という部分は、
  // 「sourceUserId が likedUsersIds 配列の中のいずれかの値と一致する」という条件を表しています。
  const mutualList = await prisma.like.findMany({
    where: {
      AND: [{ targetUserId: userId }, { sourceUserId: { in: likedUsersIds } }],
    },
    select: { sourceMember: true },
  });

  return mutualList.map((x) => x.sourceMember);
}
