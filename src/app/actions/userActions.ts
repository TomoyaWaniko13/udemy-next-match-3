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
