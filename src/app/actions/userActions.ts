'use server';

import { memberEditSchema, MemberEditSchema } from '@/lib/schemas/memberEditSchema';
import { ActionResult } from '@/types';
import { Member } from '@prisma/client';
import { getAuthUserId } from '@/app/actions/authActions';
import { prisma } from '@/lib/prisma';

// 65 (Adding the server action to update the member)
// EditForm.tsxからのデータをvalidateしてMemberの情報を更新するserver action.
export async function updateMemberProfile(data: MemberEditSchema): Promise<ActionResult<Member>> {
  try {
    const userId = await getAuthUserId();
    const validated = memberEditSchema.safeParse(data);

    if (!validated.success) return { status: 'error', error: validated.error.errors };

    const { name, description, city, country } = validated.data;

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
