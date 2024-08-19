'use server';

import { messageSchema, MessageSchema } from '@/lib/schemas/messageSchema';
import { ActionResult } from '@/types';
import { Message } from '@prisma/client';
import { getAuthUserId } from '@/app/actions/authActions';
import { prisma } from '@/lib/prisma';
import { mapMessageToMessageDto } from '@/lib/mappings';

// 82 (Creating the send message action)
// validationがsuccessならば、データベースにメッセージを記録する。
// throw errorだとerror pageが表示されるが、formのvalidation errorを表示したいので、ActionResultを使う。
export async function createMessage(recipientUserId: string, data: MessageSchema): Promise<ActionResult<Message>> {
  try {
    // 現在ログインしているuserのidを取得。
    const userId = await getAuthUserId();

    const validated = messageSchema.safeParse(data);
    if (!validated.success) return { status: 'error', error: validated.error.errors };

    const { text } = validated.data;
    const message = await prisma.message.create({
      data: { text, recipientId: recipientUserId, senderId: userId },
    });

    return { status: 'success', data: message };
  } catch (error) {
    console.log(error);
    return { status: 'error', error: 'Something went wrong' };
  }
}

// 83 (Getting the message thread)
// 84 (Creating a message DTO)
// 特定の2人のユーザー間のメッセージスレッドを取得するためのserver action.
// recipientIdは送信先のuserのidです。
export async function getMessageThread(recipientId: string) {
  try {
    // 現在ログインしているuserのidを取得。
    const userId = await getAuthUserId();

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          // 現在のユーザー（userId）が送信者で、指定された相手（recipientId）が受信者であるメッセージ
          { senderId: userId, recipientId },
          // 指定された相手（recipientId）が送信者で、現在のユーザー（userId）が受信者であるメッセージ
          { senderId: recipientId, recipientId: userId },
        ],
      },
      orderBy: { created: 'asc' },
      select: {
        id: true,
        text: true,
        created: true,
        dateRead: true,
        sender: { select: { userId: true, name: true, image: true } },
        recipient: { select: { userId: true, name: true, image: true } },
      },
    });

    return messages.map((message) => mapMessageToMessageDto(message));
  } catch (error) {
    console.log(error);
    throw error;
  }
}
