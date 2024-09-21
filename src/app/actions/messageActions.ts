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
    // 現在ログインしているuserのidを取得。
    const userId = await getAuthUserId();

    const validated = messageSchema.safeParse(data);
    if (!validated.success) return { status: 'error', error: validated.error.errors };

    const { text } = validated.data;

    const message = await prisma.message.create({
      data: {
        text,
        recipientId: recipientUserId,
        senderId: userId,
      },
      select: messageSelect,
    });

    const messageDto = mapMessageToMessageDto(message);

    // createChatId()はuserIdとrecipientUserIdを組み合わせてにchannelのIDを作っています。
    // サーバーがこの関数を実行してメッセージを作成すると、Pusherを通じて'message:new'イベントが発火されます。
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

// 特定の2人のユーザー間のメッセージスレッドを取得するためのserver actionです。.
// recipientId は現在のユーザーがチャットをしている相手の ID です。
export async function getMessageThread(recipientId: string) {
  try {
    // 現在のユーザーのIDを取得します。
    const userId = await getAuthUserId();

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          // 現在のユーザーが送信者で、チャットしている相手が受信者であるメッセージ
          { senderId: userId, recipientId, senderDeleted: false },
          // チャットしている相手が受信者で、現在のユーザー（userId）が受信者であるメッセージ
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

    // サーバーサイドで未読の messages を既読にするために、
    // 未読の messages の ID を含んだ配列を作ります。
    if (messages.length > 0) {
      const readMessagesIds = messages
        .filter(
          // 以下に未読メッセージであるための条件を書きます。
          (message) =>
            message.dateRead === null && message.recipient?.userId === userId && message.sender?.userId === recipientId,
        )
        // 未読 messages の配列から ID のみを取り出して新しい配列を作成しています。
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

// この関数は、ユーザーの受信箱（inbox）または送信箱（outbox）のメッセージを取得するためのものです。
// container が提供されていなければ、 inbox(受信箱) であるとします。
// cursor は、次のページの開始点を示す値です。この場合、メッセージの作成日時（created）をカーソルとして使用しています。
// カーソルは「しおり」のようなものです。「前回ここまで読んだ」という位置を示します。

export async function getMessagesByContainer(container?: string | null, cursor?: string, limit = 100) {
  try {
    const userId = await getAuthUserId();
    const isOutbox = container === 'outbox';

    // const conditions = {
    //   [isOutbox ? 'senderId' : 'recipientId']: userId,
    //   [isOutbox ? 'senderDeleted' : 'recipientDeleted']: false,
    // };

    let conditions = {};

    if (isOutbox) {
      conditions = { senderId: userId, senderDeleted: false };
    } else {
      conditions = { recipientId: userId, recipientDeleted: false };
    }

    let dateCondition = {};
    if (cursor) {
      dateCondition = { created: { lte: new Date(cursor) } };
    }

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
    // もし limit より多くの messages が取得できたなら、まだ次のページがあることを意味します。
    if (messages.length > limit) {
      // 配列の最後の要素を取り除き、その要素を nextItem として保存します。
      // これにより、現在のページに表示するメッセージ数を limit に調整します。
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

// deleteMessage() は、メッセージの「論理削除」と「物理削除」を組み合わせて実装しています。
// messageId: 削除するメッセージのID, isOutbox: 送信箱（outbox）からの削除かどうかを示すブール値
export async function deleteMessage(messageId: string, isOutbox: boolean) {
  // outbox(送信リスト) でメッセージの削除が行われた場合、sender(送信者)    がメッセージを削除したということです。
  // inbox (受信リスト) でメッセージの削除が行われた場合、recipient(受信者) がメッセージを削除したということです。
  const selector = isOutbox ? 'senderDeleted' : 'recipientDeleted';

  try {
    const userId = await getAuthUserId();

    await prisma.message.update({
      where: { id: messageId },
      data: { [selector]: true },
    });

    const messagesToDelete = await prisma.message.findMany({
      where: {
        // OR: には配列を指定します。
        OR: [
          { senderId: userId, senderDeleted: true, recipientDeleted: true },
          { recipientId: userId, senderDeleted: true, recipientDeleted: true },
        ],
      },
    });

    // 両方のユーザーが削除したメッセージが存在する場合、それらをデータベースから完全に削除します。
    if (messagesToDelete.length > 0) {
      await prisma.message.deleteMany({
        // where: { OR: messagesToDelete.map((message) => ({ id: message.id })) },
        where: { id: {} },
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 113 (Getting the unread message count)
// この server action で取得できる未読のメッセージの件数を<Providers/>でstoreに保存することで、
// どこからでも未読のメッセージの件数にアクセスできるようになります。
export async function getUnreadMessageCount() {
  try {
    const userId = await getAuthUserId();

    // 現在のユーザーが受け取って, 現在のユーザーが消去していない, 未読のmessageの個数を取得します。
    return prisma.message.count({
      where: {
        recipientId: userId,
        recipientDeleted: false,
        dateRead: null,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 98 (Adding the live chat functionality)
const messageSelect = {
  id: true,
  text: true,
  created: true,
  dateRead: true,
  // selectが使われているので、senderはobjectとして扱われる。
  sender: { select: { userId: true, name: true, image: true } },
  // selectが使われているので、recipientはobjectとして扱われる。
  recipient: { select: { userId: true, name: true, image: true } },
};
