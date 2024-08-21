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
        // selectが使われているので、senderはobjectとして扱われる。
        sender: { select: { userId: true, name: true, image: true } },
        // selectが使われているので、recipientはobjectとして扱われる。
        recipient: { select: { userId: true, name: true, image: true } },
      },
    });

    // データベースから取得したメッセージの配列を、mapMessageToMessageDto()でフロントエンドで使用しやすい形式に変換しています。
    // 例えば、以下のような変換が行われます：
    // 変換前の配列（MessageWithSenderRecipient型）
    // [
    //   {
    //     id: "1",
    //     text: "Hello",
    //     created: Date(2023-08-18T15:30:00),
    //     dateRead: null,
    //     sender: { userId: "user1", name: "Alice", image: "alice.jpg" },
    //     recipient: { userId: "user2", name: "Bob", image: "bob.jpg" }
    //   },
    //   // ...他のメッセージオブジェクト
    // ]
    //
    // // 変換後の配列（MessageDto型）
    // [
    //   {
    //     id: "1",
    //     text: "Hello",
    //     created: "18 Aug 23 3:30:PM",
    //     dateRead: null,
    //     senderId: "user1",
    //     senderName: "Alice",
    //     senderImage: "alice.jpg",
    //     recipientId: "user2",
    //     recipientName: "Bob",
    //     recipientImage: "bob.jpg"
    //   },
    //   // ...変換された他のメッセージオブジェクト
    // ]
    return messages.map((message) => mapMessageToMessageDto(message));
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 89 (Creating the fetch messages action)
export async function getMessagesByContainer(container: string) {
  try {
    const userId = await getAuthUserId();

    // 'outbox'(送信)が選択されている場合、ログインしているユーザーが送信したmessageを取得するので、'senderId'を使う。
    // そうでない場合、ログインしているユーザーが受信したmessageを取得するので、'recipientId'を使う。
    const selector = container === 'outbox' ? 'senderId' : 'recipientId';

    const messages = await prisma.message.findMany({
      where: { [selector]: userId },
      orderBy: { created: 'desc' },
      select: {
        id: true,
        text: true,
        created: true,
        dateRead: true,
        // selectが使われているので、senderはobjectとして扱われる。
        sender: { select: { userId: true, name: true, image: true } },
        // selectが使われているので、recipientはobjectとして扱われる。
        recipient: { select: { userId: true, name: true, image: true } },
      },
    });

    return messages.map((message) => mapMessageToMessageDto(message));
  } catch (error) {
    console.log(error);
    throw error;
  }
}
