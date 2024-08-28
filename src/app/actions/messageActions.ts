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
// validationがsuccessならば、データベースにメッセージを記録する。
// throw errorだとerror pageが表示されるが、formのvalidation errorを表示したいので、ActionResultを使う。
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
    // この仕組みにより、メッセージの送信者だけでなく、受信者のUIも即座に更新されます。
    await pusherServer.trigger(createChatId(userId, recipientUserId), 'message:new', messageDto);
    // メッセージの受信者(recipient)に対して「新しいメッセージが届きました」という通知をリアルタイムで送ることができます。
    // これにより、受信者はアプリを再読み込みしたり、手動で更新したりすることなく、新しいメッセージをすぐに確認できるようになります。
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
          {
            senderId: userId,
            recipientId,
            senderDeleted: false,
          },
          // 指定された相手（recipientId）が送信者で、現在のユーザー（userId）が受信者であるメッセージ
          {
            senderId: recipientId,
            recipientId: userId,
            recipientDeleted: false,
          },
        ],
      },
      // メッセージは作成日時の昇順で並べられます。
      orderBy: { created: 'asc' },
      select: messageSelect,
    });

    // ここでは、取得したメッセージの中で未読のものを特定し、それらを既読にします。
    // また、Pusherを使って、メッセージが既読になったことをリアルタイムで通知します。
    if (messages.length > 0) {
      // filter()とmap()で未読メッセージの特定をしています。
      const readMessagesIds = messages
        .filter(
          (m) =>
            // まだ既読になっていない（dateReadがnull）
            // この条件により、既に読まれたメッセージを再度「既読」にする無駄な処理を避けられます。
            m.dateRead === null &&
            // 受信者が現在のユーザー
            // ユーザーは自分宛てのメッセージのみを「既読」にすべきです。他人宛てのメッセージを既読にすることは適切ではありません。
            m.recipient?.userId === userId &&
            // 送信者がrecipientIdで指定された相手
            // ユーザーが特定の相手とのチャットを見ているときに、そのチャットとは関係のない他の相手からのメッセージの状態が変わることを防ぎます。
            m.sender?.userId === recipientId,
        )
        // フィルタリングされたメッセージから id のみを取り出して新しい配列を作成しています。
        .map((m) => m.id);

      // 特定した未読メッセージのIDを使用して、データベース内のそれらのメッセージを一括で更新します。
      // dateReadフィールドに現在の日時を設定することで、これらのメッセージを既読にマークします。
      await prisma.message.updateMany({
        //  'id' が readMessagesIds 配列の中のいずれかの値と一致することを条件としています。
        where: { id: { in: readMessagesIds } },
        data: { dateRead: new Date() },
      });

      // 'message:read' イベントを発火させ、既読になったメッセージのID配列を送信します。
      // クライアントサイド(MessageList.tsx)では、このイベントを以下のように監視しています：
      // channelRef.current.bind('message:read', handleReadMessages);
      // handleReadMessages 関数が、サーバーから送られた readMessagesIds を受け取り、対応するメッセージの既読状態を更新します。
      // これにより、メッセージの送信者のUIでも、メッセージが既読になったことがリアルタイムで反映されます。
      await pusherServer.trigger(createChatId(recipientId, userId), 'message:read', readMessagesIds);
    }

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
// 93 (Adding the delete message action)
//　この関数は、ユーザーの受信箱（inbox）または送信箱（outbox）のメッセージを取得するためのものです。
export async function getMessagesByContainer(container: string) {
  try {
    const userId = await getAuthUserId();

    // container の値に応じて以下のようなオブジェクトが生成されます：
    // container が 'outbox' の場合:
    // {
    //   senderId: userId,
    //   senderDeleted: false
    // }
    // container が 'outbox' でない場合（つまり 'inbox' の場合）:
    // {
    //   recipientId: userId,
    //   recipientDeleted: false
    // }

    const conditions = {
      // [] 内に式を記述することで、その式の評価結果がプロパティ名として使用されます。
      // 'outbox'(送信箱)が選択されている場合、ログインしているユーザーが送信したmessageを取得するので、'senderId'を使う。
      // そうでない場合、ログインしているユーザーが受信したmessageを取得するので、'recipientId'を使う。
      [container === 'outbox' ? 'senderId' : 'recipientId']: userId,
      // これはスプレッド演算子 (...) と三項演算子(?)を組み合わせています。
      // container === 'outbox' が true の場合、{ senderDeleted: false } というオブジェクトが展開されます。
      // false の場合、{ recipientDeleted: false } が展開されます。
      ...(container === 'outbox' ? { senderDeleted: false } : { recipientDeleted: false }),
    };

    const messages = await prisma.message.findMany({
      // where: conditionsについて:
      // 'outbox' の場合:
      // where: {
      //   senderId: userId,
      //   senderDeleted: false
      // }
      // これは「ユーザーIDが userId で、送信者が削除していないメッセージ」を意味します。

      // 'inbox' の場合:
      // where: {
      //   recipientId: userId,
      //   recipientDeleted: false
      // }
      // これは「ユーザーIDが userId で、受信者が削除していないメッセージ」を意味します。
      where: conditions,
      // メッセージを作成日時の降順（最新のものから）でソートします。
      orderBy: { created: 'desc' },
      select: messageSelect,
    });

    return messages.map((message) => mapMessageToMessageDto(message));
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 93 (Adding the delete message action)
// deleteMessage() は、メッセージの「論理削除」と「物理削除」を組み合わせて実装しています。

// 論理削除の実装:
// ユーザーがメッセージを「削除」した時、即座にデータベースから完全に削除するのではなく、まず「削除済み」としてマークします。
// これにより、ユーザーの視点からはメッセージが削除されたように見えますが、実際にはデータベースに残っています
//
//　双方向の削除管理:
// メッセージの送信者と受信者それぞれが独立して「削除」操作を行えるようにします。
// 一方のユーザーが削除しても、もう一方のユーザーにはまだメッセージが見えるようになっています。

//　完全削除（物理削除）の実行:
// 送信者と受信者の両方が削除したと判断されたメッセージのみを、データベースから完全に削除します。

// messageId: 削除するメッセージのID
// isOutbox: 送信箱（outbox）からの削除かどうかを示すブール値
export async function deleteMessage(messageId: string, isOutbox: boolean) {
  // この行では、送信者と受信者のどちらの視点から削除するかを決定しています。
  const selector = isOutbox ? 'senderDeleted' : 'recipientDeleted';

  try {
    const userId = await getAuthUserId();

    await prisma.message.update({
      // 指定されたメッセージのIDに対して、senderDeleted または recipientDeleted フラグを true に設定します。
      // これにより、メッセージは該当するユーザーの視点からは「削除された」ように見えますが、データベースには依然として存在します。
      where: { id: messageId },
      // この部分は、動的に決定されたプロパティ名（selectorの値）を持つオブジェクトを作成しています。
      // [] 内の selector は変数として評価され、その値がプロパティ名になります。
      data: { [selector]: true },
    });

    // この部分では、送信者と受信者の両方が削除したメッセージ（つまり、senderDeleted と recipientDeleted の両方がtrue のメッセージ）
    // を検索しています。
    //　これらのメッセージは「安全に削除可能」と見なされます。なぜなら：
    // 両方のユーザーがすでにこれらのメッセージを見えなくしたいと表明している（両方が削除フラグを立てている）
    // 現在のユーザーが関与しているメッセージのみを対象としている（セキュリティ上の理由）
    const messagesToDelete = await prisma.message.findMany({
      where: {
        OR: [
          // 現在のユーザーが送信者である
          // 送信者（現在のユーザー）が削除したとマークしている
          // 受信者も削除したとマークしている
          {
            senderId: userId,
            senderDeleted: true,
            recipientDeleted: true,
          },
          // 現在のユーザーが受信者である
          // 送信者が削除したとマークしている
          // 受信者（現在のユーザー）も削除したとマークしている
          {
            recipientId: userId,
            senderDeleted: true,
            recipientDeleted: true,
          },
        ],
      },
    });

    // 両方のユーザーが削除したメッセージが存在する場合、それらをデータベースから完全に削除します。
    if (messagesToDelete.length > 0) {
      await prisma.message.deleteMany({
        where: {
          // このmap関数は、messagesToDelete配列の各要素に対して実行されます。
          // 各メッセージmから、{ id: m.id }というオブジェクトを生成します。
          // 結果として、[{ id: 'id1' }, { id: 'id2' }, ...]のような配列が生成されます。

          // このOR条件は、生成された id のリストのいずれかに一致するメッセージを削除することを指示します。
          // 実質的に、「これらのIDのいずれかを持つメッセージを削除せよ」という命令になります。

          // この方法により、複数のメッセージを1回のクエリで効率的に削除することができます。
          OR: messagesToDelete.map((m) => ({ id: m.id })),
        },
      });
    }
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
