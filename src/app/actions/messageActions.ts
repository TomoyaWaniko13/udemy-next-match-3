'use server';

import { messageSchema, MessageSchema } from '@/lib/schemas/messageSchema';
import { ActionResult, MessageDto } from '@/types';
import { getAuthUserId } from '@/app/actions/authActions';
import { prisma } from '@/lib/prisma';
import { mapMessageToMessageDto } from '@/lib/mappings';
import { pusherServer } from '@/lib/pusher';
import { createChatId } from '@/lib/util';

// 82 (Creating the send message action)
// 98 (Adding the live chat functionality)
// 109 (Creating a message store)

// throw error だとerror page が表示されますが、
// form で validation error を表示したいので、ActionResult を return type として使います。
export async function createMessage(recipientUserId: string, data: MessageSchema): Promise<ActionResult<MessageDto>> {
  try {
    const userId = await getAuthUserId();

    // validation が失敗したら、error を返却します。
    const validated = messageSchema.safeParse(data);
    if (!validated.success) return { status: 'error', error: validated.error.errors };

    const { text } = validated.data;

    const message = await prisma.message.create({
      // From the current user to the recipient user
      data: { text, senderId: userId, recipientId: recipientUserId },
      select: messageSelect,
    });

    const messageDto = mapMessageToMessageDto(message);

    // クライアントサイド(MessageList.tsx)で以下のように監視されているイベントです：
    // channelRef.current.bind('message:new', handleNewMessage);
    await pusherServer.trigger(createChatId(userId, recipientUserId), 'message:new', messageDto);

    // メッセージの受信者(recipient)に対して「新しいメッセージが届きました」という通知を個人にリアルタイムで送ることができます。
    // private channelの名前は'private-'で始める必要があります。eventの名前に制約はありません。
    await pusherServer.trigger(`private-${recipientUserId}`, 'message:new', messageDto);

    return { status: 'success', data: messageDto };
  } catch (error) {
    console.log(error);
    return { status: 'error', error: 'Something went wrong' };
  }
}

// 83 (Getting the message thread)
// 84 (Creating a message DTO)
// 91 (Adding the message read functionality)
// 93 (Adding the delete message action)
// 101 (Adding the read message feature)
// 114 (Updating the count based on the event)

// 特定の2人のユーザー間のメッセージスレッドを取得するための server actionです。
// targetUserId は現在のユーザーがチャットをしている相手の ID です。
export async function getMessageThread(targetUserId: string) {
  try {
    const userId = await getAuthUserId();

    const messages = await prisma.message.findMany({
      where: {
        // OR: には配列を指定します。
        OR: [
          // From the current user(senderId: userId), To the target user(recipientId: targetUserId)
          { senderId: userId, recipientId: targetUserId, senderDeleted: false },
          // From the target user(senderId: targetUserId), To the current user(recipientId: userId)
          { senderId: targetUserId, recipientId: userId, recipientDeleted: false },
        ],
      },
      // メッセージは作成日時の昇順(古いものから新しいもの順)で並べられます。
      orderBy: { created: 'asc' },
      select: messageSelect,
    });

    // 既読のメッセージの件数を表します。その件数を、未読メッセージの表示の件数から引きます。
    let readCount = 0;

    if (messages.length > 0) {
      const unreadMessagesIds = messages
        // Unread && From the target user && To the current user
        .filter((message) => message.dateRead === null && message.sender?.userId === targetUserId && message.recipient?.userId === userId)
        .map((unreadMessage) => unreadMessage.id);

      await prisma.message.updateMany({
        // 'id' が 'unreadMessagesIds' 配列の中の 'いずれか(in)' の値と一致することを条件としています。
        // 'OR' を使って書き直すこともできます。
        where: { id: { in: unreadMessagesIds } },
        // dateRead フィールドに現在の日時を設定することで、unreadMessages を既読にマークします。
        data: { dateRead: new Date() },
      });

      // 既読になったメッセージの件数を表します。その件数を、未読メッセージの表示の件数から引きます。
      readCount = unreadMessagesIds.length;

      // 'message:read' イベントを発火させ、既読になったメッセージのID配列を送信します。
      // クライアントサイド(MessageList.tsx) では、このイベントを以下のように監視しています：
      // channelRef.current.bind('message:read', handleReadMessages);
      await pusherServer.trigger(createChatId(targetUserId, userId), 'messages:read', unreadMessagesIds);
    }

    const messagesToReturn = messages.map((message) => mapMessageToMessageDto(message));
    return { messages: messagesToReturn, readCount };
    //
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 89 (Creating the fetch messages action)
// 93 (Adding the delete message action)
// 131 (Cursor based pagination)
// 132 (Cursor based pagination Part 2)

export async function getMessagesByContainer(container?: string | null, cursor?: string, limit = 10) {
  try {
    const userId = await getAuthUserId();
    const isOutbox = container === 'outbox';

    // outbox で表示されるメッセージの送信者は、現在のユーザーです。
    const outboxInboxFilter = isOutbox ? { senderId: userId, senderDeleted: false } : { recipientId: userId, recipientDeleted: false };

    // cursor が存在したら、new Date(cursor) 以前のデータを取得するという条件です。
    const dateFilter = cursor ? { created: { lte: new Date(cursor) } } : {};

    const messages = await prisma.message.findMany({
      where: { ...outboxInboxFilter, ...dateFilter },
      // メッセージを作成日時の降順（最新のものから）でソートします。
      orderBy: { created: 'desc' },
      select: messageSelect,
      take: limit + 1,
    });

    let nextCursor: string | undefined;

    // データベースから messages.length 個 (limit + 1 個)の messages を取得しています。
    // もし limit 個より多くの messages が取得できたなら、まだ次のページがあることを意味します。
    if (messages.length > limit) {
      const nextMessage = messages.pop();
      // toString() を使用した場合：ローカルタイムゾーンに依存します。
      // 形式が地域や言語設定によって変わる可能性があります。ミリ秒の情報が失われます。
      nextCursor = nextMessage?.created.toISOString();
    } else {
      // 取得したメッセージの数が limit 以下の場合, これ以上データがないことを意味します。
      // したがって、nextCursor を undefined に設定し、最後のページであることを示します。
      nextCursor = undefined;
    }

    const messagesToReturn = messages.map((message) => mapMessageToMessageDto(message));

    // 取得したメッセージと次のカーソル(開始地点)を返します。
    return { messages: messagesToReturn, nextCursor };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 93 (Adding the delete message action)
// 'messageId' は削除するメッセージの ID です。
export async function deleteMessage(messageId: string, isOutbox: boolean) {
  // outbox でメッセージが削除されたら、現在のユーザーはそのメッセージの送信者でした。
  const deletionField = isOutbox ? 'senderDeleted' : 'recipientDeleted';

  try {
    const userId = await getAuthUserId();

    // 論理削除を行なっています。
    await prisma.message.update({
      where: { id: messageId },
      data: { [deletionField]: true },
    });

    // OR: には配列を指定します。
    const messagesToDelete = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, senderDeleted: true, recipientDeleted: true },
          { recipientId: userId, senderDeleted: true, recipientDeleted: true },
        ],
      },
    });

    // 両方のユーザーが削除したメッセージが存在する場合、それらをデータベースから完全に削除します。
    if (messagesToDelete.length > 0) {
      // OR: には配列を指定します。'in' を使って書き直すこともできます。
      // where: {id: {in: messagesToDelete.map(message => message.id)}
      await prisma.message.deleteMany({
        where: { OR: messagesToDelete.map((message) => ({ id: message.id })) },
      });
    }
    //
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 113 (Getting the unread message count)
// この server action で取得できる未読のメッセージの件数を <Providers/> で store に保存することで、
// どこからでも未読のメッセージの件数にアクセスできるようになります。
export async function getUnreadMessageCount() {
  try {
    const userId = await getAuthUserId();

    return prisma.message.count({
      // To the current user (recipientId: userId)
      where: { recipientId: userId, recipientDeleted: false, dateRead: null },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 98 (Adding the live chat functionality)
// senderId, recipientId, senderDeleted と recipientDeleted は選択されません。
// index.d.ts の MessageWithSenderRecipient で select されているフィールドを選択しています。
const messageSelect = {
  id: true,
  text: true,
  created: true,
  dateRead: true,
  sender: { select: { userId: true, name: true, image: true } },
  recipient: { select: { userId: true, name: true, image: true } },
};
