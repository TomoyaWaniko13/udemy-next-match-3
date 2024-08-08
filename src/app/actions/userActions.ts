'use server';

import { memberEditSchema, MemberEditSchema } from '@/lib/schemas/memberEditSchema';
import { ActionResult } from '@/types';
import { Member, Photo } from '@prisma/client';
import { getAuthUserId } from '@/app/actions/authActions';
import { prisma } from '@/lib/prisma';

// 65 (Adding the server action to update the member)
// 75 (Challenge solution)
// EditForm.tsxからのデータをvalidateしてMemberの情報を更新するserver action.
// 75でnameUpdatedを追加。user Profileをアップデートした時にnameがアップデートされる。
export async function updateMemberProfile(data: MemberEditSchema, nameUpdated: boolean): Promise<ActionResult<Member>> {
  try {
    const userId = await getAuthUserId();
    const validated = memberEditSchema.safeParse(data);

    if (!validated.success) return { status: 'error', error: validated.error.errors };

    const { name, description, city, country } = validated.data;

    // 75で追加。
    if (nameUpdated) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    // Member modelの全てのpropertiesを更新しなくても良い。
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
// what we're doing here is nothing to do with Cloudinary.
// We're going to call this function after the image has been successfully uploaded into Cloudinary.
export async function addImage(url: string, publicId: string) {
  try {
    const userId = await getAuthUserId();
    return prisma.member.update({
      where: { userId },
      data: { photo: { create: [{ url, publicId }] } },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 73 (Setting the main image)
// 画像の<StarButton/>を押した時に、その画像をMainにする。
export async function setMainImage(photo: Photo) {
  try {
    const userId = await getAuthUserId();

    //  we've got two places we need to update the image here.
    //  So inside the User we have an image property.
    //  And also we've got the image property inside the Member.
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

// 75 (Challenge solution)
// mainの写真を変更した時、<TopNav/>で写真の表示を変更するために使う。
export async function getUserInfoForNav() {
  try {
    const userId = await getAuthUserId();

    // アップデートされたuserのnameとimageをreturnする。
    return prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
