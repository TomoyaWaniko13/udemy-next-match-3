'use server';

import { getUserRole } from '@/app/actions/authActions';
import { prisma } from '@/lib/prisma';
import { Photo } from '@prisma/client';
import { cloudinary } from '@/lib/cloudinary';

// 162. Adding the photo moderation functionality part 2
// role が ADMIN であれば、認証されていない photos を表示します。
export async function getUnapprovedPhotos() {
  try {
    // 現在の user の role を取得します。
    const role = await getUserRole();

    if (role !== 'ADMIN') throw new Error('Forbidden');

    return prisma.photo.findMany({
      where: { isApproved: false },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 163. Adding the photo moderation functionality part 3
export async function approvePhoto(photoId: string) {
  try {
    const role = await getUserRole();

    if (role !== 'ADMIN') throw new Error('Forbidden');

    // 変数 photo をホバーすることで、この変数の型を確認できます。
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      // include オプションを使用して、関連するデータも一緒に取得するよう指示しています。
      // member を含めることで、その写真に関連付けられた Member の情報も取得します。
      // さらに、member の中で user: true と指定することで、その Member に関連付けられた User の情報も取得します
      include: { member: { include: { user: true } } },
    });

    if (!photo || !photo.member || !photo.member.user) throw new Error('Cannot approve this image');

    // member と user の image property を更新することで、
    // その image を main の画像として扱うことができます。
    const { member } = photo;
    const { user } = member;

    // まだ main image が 存在しなければ、query { image: photo.url } と Prisma で
    // member と user の image property を更新します。
    // これにより、この image が main になります。
    const userUpdate = user && user.image === null ? { image: photo.url } : {};
    const memberUpdate = member.image === null ? { image: photo.url } : {};

    if (Object.keys(userUpdate).length > 0) {
      // Userテーブルの特定のレコードを更新します。
      await prisma.user.update({
        where: { id: member.userId },
        data: userUpdate,
      });
    }

    // Memberテーブルの特定のレコードを更新します。
    return prisma.member.update({
      where: { id: member.id },
      data: {
        ...memberUpdate,
        // この Member に関連付けられた photos も同時に更新します。Relation queriesを使用しています。
        // property name -> update -> where & data
        // https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#update-or-create-a-related-record
        photos: {
          update: {
            where: { id: photo.id },
            data: { isApproved: true },
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 163. Adding the photo moderation functionality part 3

export async function rejectPhoto(photo: Photo) {
  try {
    const role = await getUserRole();

    if (role !== 'ADMIN') {
      throw new Error('Forbidden');
    }

    if (photo.publicId) {
      await cloudinary.v2.uploader.destroy(photo.publicId);
    }

    return prisma.photo.delete({
      where: { id: photo.id },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
