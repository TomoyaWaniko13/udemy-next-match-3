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

    // validation
    const validated = messageSchema.safeParse(data);
    if (!validated.success) return { status: 'error', error: validated.error.errors };

    // extract the form data after the validation
    const { text } = validated.data;

    const message = await prisma.message.create({
      data: {
        text,
        // From the current user
        senderId: userId,
        // To the recipient user
        recipientId: recipientUserId,
      },
      select: messageSelect,
    });

    const messageDto = mapMessageToMessageDto(message);

    // サーバーがこの関数を実行してメッセージを作成すると、Pusher を通じて 'message:new' イベントが発火されます。
    // これは、クライアントサイド(MessageList.tsx)で以下のように監視されているイベントです：
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
// recipientId は現在のユーザーがチャットをしている相手の ID です。
export async function getMessageThread(recipientId: string) {
  try {
    const userId = await getAuthUserId();

    const messages = await prisma.message.findMany({
      where: {
        // OR: には配列を指定します。
        OR: [
          // From the current user To the recipient user
          { senderId: userId, recipientId, senderDeleted: false },
          // From the recipient user To the current user
          { senderId: recipientId, recipientId: userId, recipientDeleted: false },
        ],
      },
      // メッセージは作成日時の昇順で並べられます。
      orderBy: { created: 'asc' },
      select: messageSelect,
    });

    // 114 (Updating the count based on the event)
    // 既読のメッセージの件数を表します。その件数を、未読メッセージの表示の件数から引きます。
    let readCount = 0;

    // サーバーサイドで未読の messages を既読にするために、未読の messages の ID を含んだ配列を作ります。
    if (messages.length > 0) {
      const readMessagesIds = messages
        .filter((message) => message.dateRead === null && message.recipient?.userId === userId && message.sender?.userId === recipientId)
        .map((unreadMessage) => unreadMessage.id);

      // 特定した未読 messages のIDを使用して、データベース内のそれらのメッセージを一括で更新します。
      // dateReadフィールドに現在の日時を設定することで、これらのメッセージを既読にマークします。
      await prisma.message.updateMany({
        //  'id' が readMessagesIds 配列の中のいずれかの値と一致することを条件としています。
        where: { id: { in: readMessagesIds } },
        data: { dateRead: new Date() },
      });

      // 114 (Updating the count based on the event)
      // 既読になったのメッセージの件数を表します。その件数を、未読メッセージの表示の件数から引きます。

      readCount = readMessagesIds.length;

      // 'message:read' イベントを発火させ、既読になったメッセージのID配列を送信します。
      // クライアントサイド(MessageList.tsx) では、このイベントを以下のように監視しています：
      // channelRef.current.bind('message:read', handleReadMessages);
      await pusherServer.trigger(createChatId(recipientId, userId), 'messages:read', readMessagesIds);
    }

    const messagesToReturn = messages.map((message) => mapMessageToMessageDto(message));

    return { messages: messagesToReturn, readCount };
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
    // from or to ?
    const isOutbox = container === 'outbox';

    // const conditions = {
    //   [isOutbox ? 'senderId' : 'recipientId']: userId,
    //   [isOutbox ? 'senderDeleted' : 'recipientDeleted']: false,
    // };

    let conditions = {};

    // from userId or to userId ?
    if (isOutbox) {
      // from userId
      conditions = { senderId: userId, senderDeleted: false };
    } else {
      // to userId
      conditions = { recipientId: userId, recipientDeleted: false };
    }

    let dateCondition = {};

    if (cursor) dateCondition = { created: { lte: new Date(cursor) } };

    const messages = await prisma.message.findMany({
      // Spread syntax (...) を使うことで、conditions に加えてさらに条件を指定できます。
      // cursor が提供されている場合、created: { lte: new Date(cursor) } という条件が追加されます。
      // これは「cursor(どこから始めるか) の日時(equal) とそれ以前に作成されたメッセージ(less than) 」を意味します。
      // cursor が undefined の場合, 追加の条件なし（全てのメッセージが対象になります)。
      where: {
        ...conditions,
        ...dateCondition,
        // ...(cursor ? { created: { lte: new Date(cursor) } } : {}),
      },
      // メッセージを作成日時の降順（最新のものから）でソートします。
      orderBy: { created: 'desc' },
      select: messageSelect,
      // limit は、一度に取得するデータの最大数を指定するパラメータです。一回のクエリで取得するメッセージの数を"制限"しています。
      // もし limit より多くの messages が取得できたなら、まだ次のページがあることを意味します。
      take: limit + 1,
    });

    let nextCursor: string | undefined;

    // データベースから limit + 1 個の, つまり messages.length 個の messages を取得しています。
    // もし limit 個より多くの messages が取得できたなら、まだ次のページがあることを意味します。
    if (messages.length > limit) {
      const nextItem = messages.pop();
      // nextItem の作成日時を次の cursor として設定します。
      // これが次のページの開始点になります。

      // toString() を使用した場合：
      // ローカルタイムゾーンに依存します。
      // 形式が地域や言語設定によって変わる可能性があります。
      // ミリ秒の情報が失われます。
      nextCursor = nextItem?.created.toISOString();

      // 取得したメッセージの数が limit 以下の場合, これ以上データがないことを意味します。
    } else {
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

// messageId: 削除するメッセージのID, isOutbox: 送信箱（outbox）からの削除かどうか。
export async function deleteMessage(messageId: string, isOutbox: boolean) {
  // From the current user or
  // To the current user?
  const selector = isOutbox ? 'senderDeleted' : 'recipientDeleted';

  try {
    const userId = await getAuthUserId();

    // 論理削除を行なっています。
    await prisma.message.update({
      where: { id: messageId },
      data: { [selector]: true },
    });

    const messagesToDelete = await prisma.message.findMany({
      where: {
        // OR: には配列を指定します。
        OR: [
          // From the current user
          { senderId: userId, senderDeleted: true, recipientDeleted: true },
          // To the current user
          { recipientId: userId, senderDeleted: true, recipientDeleted: true },
        ],
      },
    });

    // 両方のユーザーが削除したメッセージが存在する場合、それらをデータベースから完全に削除します。
    if (messagesToDelete.length > 0) {
      await prisma.message.deleteMany({
        // OR: には配列を指定します。
        where: { OR: messagesToDelete.map((message) => ({ id: message.id })) },
        // where: { id: {} },
      });
    }
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
      // To the current user
      where: { recipientId: userId, recipientDeleted: false, dateRead: null },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 98 (Adding the live chat functionality)
// senderDeleted と recipientDeleted は選択されません。
const messageSelect = {
  id: true,
  text: true,
  created: true,
  dateRead: true,
  sender: { select: { userId: true, name: true, image: true } },
  recipient: { select: { userId: true, name: true, image: true } },
};
