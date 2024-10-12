'use server';

import { memberEditSchema, MemberEditSchema } from '@/lib/schemas/memberEditSchema';
import { ActionResult } from '@/types';
import { Member, Photo } from '@prisma/client';
import { getAuthUserId } from '@/app/actions/authActions';
import { prisma } from '@/lib/prisma';
import { cloudinary } from '@/lib/cloudinary';

// 65 (Adding the server action to update the member)
// 75 (Challenge solution)

// <EditForm/> からのデータを validation して Member の情報を更新する server action.
// <EditForm/> で name を変更した時に、つまり引数の nameUpdated が true の時、その変更を user model に保存します。
// これにより、下で定義されている getUserInfoForNav() で変更された name を データベースから取得して、
// <TopNav/> に最新の情報を反映されることができます。
export async function updateMemberProfile(data: MemberEditSchema, nameUpdated: boolean): Promise<ActionResult<Member>> {
  try {
    const validated = memberEditSchema.safeParse(data);
    if (!validated.success) return { status: 'error', error: validated.error.errors };

    const { name, description, city, country } = validated.data;

    const userId = await getAuthUserId();

    if (nameUpdated) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    //  name, description, city, country だけを更新します。
    const member = await prisma.member.update({
      where: { userId },
      data: { name, description, city, country },
    });

    return { status: 'success', data: member };
  } catch (error) {
    console.log(error);
    return { status: 'error', error: 'Something went wrong' };
  }
}

// 71 (Adding the image upload server actions)

// 第一引数の url は 画像にアクセスできるURLを表しています。
// 第二引数の public_id は ユニークなstring と Cloudinary上で保存されるフォルダ一の名前を組み合わせたものです。
export async function addImage(url: string, publicId: string) {
  try {
    const userId = await getAuthUserId();
    return prisma.member.update({
      where: { userId },
      data: { photos: { create: [{ url, publicId }] } },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 73 (Setting the main image)
// 161. Adding the photo moderation functionality part 1

// 画像の<StarButton/>を押した時に、その画像をMainにする。
export async function setMainImage(photo: Photo) {
  // 承認された写真でないと、メイン画像として設定できません。
  // このエラーメッセージが toast で表示されます。
  if (!photo.isApproved) throw new Error('Only approved photos can be set to main image');

  try {
    const userId = await getAuthUserId();

    await prisma.user.update({
      where: { id: userId },
      data: { image: photo.url },
    });

    return prisma.member.update({
      where: { userId },
      data: { image: photo.url },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 76 (Deleting an image)
export async function deleteImage(photo: Photo) {
  try {
    const userId = await getAuthUserId();

    // photo.publicId は ユニークなstring と
    // Cloudinary上で保存されるフォルダ一の名前を組み合わせたものです。
    // photo.publicId が存在すれば、Cloudinary の photo であるということです。
    // そうであれば、Cloudinary からも photo を削除する必要があります。
    if (photo.publicId) {
      await cloudinary.v2.uploader.destroy(photo.publicId);
    }

    return prisma.member.update({
      where: { userId },
      data: { photos: { delete: { id: photo.id } } },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 75 (Challenge solution)

// main の写真を変更した時、<TopNav/> で写真の表示を変更するために使います。サーバーサイドから session cookie を
// 編集して session cookie の name と image を変更できないため、クライアントサイドから session cookie の
// 変更された name と image を取得することはできません。なので、getUserInfoForNav() によって、 <TopNav/> で使用される、
// 更新された name と image を データベースから返却する必要があります。
export async function getUserInfoForNav() {
  try {
    const userId = await getAuthUserId();

    // アップデートされた user の name と image を return します。
    return prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true },
    });
    //
  } catch (error) {
    console.log(error);
    throw error;
  }
}
