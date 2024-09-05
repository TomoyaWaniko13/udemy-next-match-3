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

    // 114 (Updating the count based on the event)
    // 既読のメッセージの件数を表します。その件数を、未読メッセージの表示の件数から引きます。
    let readCount = 0;

    // 取得したメッセージの中で、現在のユーザーが受信者、recipientIdで指定された相手が送信者、
    // 尚且つ未読のものを特定し、それらを既読にします。
    // また、Pusherを使って、メッセージが既読になったことをリアルタイムで通知します。
    if (messages.length > 0) {
      const readMessagesIds = messages
        // filter() で未読メッセージのarrayを作ります。
        .filter(
          (message) =>
            // まだ既読になっていない（dateReadがnull）
            // この条件により、既に読まれたメッセージを再度「既読」にする無駄な処理を避けられます。
            message.dateRead === null &&
            // 受信者が現在のユーザー
            // ユーザーは自分宛てのメッセージのみを「既読」にすべきです。他人宛てのメッセージを既読にすることは適切ではありません。
            message.recipient?.userId === userId &&
            // 送信者がrecipientIdで指定された相手
            // ユーザーが特定の相手とのチャットを見ているときに、そのチャットとは関係のない他の相手からのメッセージの状態が変わることを防ぎます。
            message.sender?.userId === recipientId,
        )
        // 未読メッセージの配列から id のみを取り出して新しい配列を作成しています。
        .map((unreadMessage) => unreadMessage.id);

      // 特定した未読メッセージのIDを使用して、データベース内のそれらのメッセージを一括で更新します。
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
      // クライアントサイド(MessageList.tsx)では、このイベントを以下のように監視しています：
      // channelRef.current.bind('message:read', handleReadMessages);
      // handleReadMessages 関数が、サーバーから送られた readMessagesIds を受け取り、対応するメッセージの既読状態を更新します。
      // これにより、メッセージの送信者のUIでも、メッセージが既読になったことがリアルタイムで反映されます。
      await pusherServer.trigger(createChatId(recipientId, userId), 'messages:read', readMessagesIds);
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
export async function getMessagesByContainer(container?: string | null, cursor?: string, limit = 2) {
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
      // 'outbox'(送信箱) が選択されている場合、ログインしているユーザーが送信した message を取得するので、
      // userId として 'senderId' を使います。
      // そうでない場合、ログインしているユーザーが受信したmessageを取得するので、userIdとして'recipientId'を使います。
      [container === 'outbox' ? 'senderId' : 'recipientId']: userId,
      // これはスプレッド演算子 (...) と三項演算子(?)を組み合わせています。
      // container === 'outbox' が true の場合、{ senderDeleted: false } というオブジェクトが展開されます。
      // false の場合、{ recipientDeleted: false } が展開されます。
      ...(container === 'outbox' ? { senderDeleted: false } : { recipientDeleted: false }),
    };

    const messages = await prisma.message.findMany({
      where: {
        // Spread syntax (...) を使うことで、conditions に加えてさらに条件を指定できます。
        ...conditions,
        // cursor が提供されている場合、created: { lte: new Date(cursor) } という条件が追加されます。
        // これは「cursor(どこから始めるか) の日時(equal) とそれ以前に作成されたメッセージ(less than) 」を意味します。
        // cursor が undefined の場合, 追加の条件なし（全てのメッセージが対象になります)。
        ...(cursor ? { created: { lte: new Date(cursor) } } : {}),
      },
      // メッセージを作成日時の降順（最新のものから）でソートします。
      orderBy: { created: 'desc' },
      select: messageSelect,
      // limit は、一度に取得するデータの最大数を指定するパラメータです。一回のクエリで取得するメッセージの数を"制限"しています。
      // 次のページがあるかどうかを判断するため、limit より1つ多く取得しています。
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

// 113 (Getting the unread message count)
export async function getUnreadMessageCount() {
  try {
    const userId = await getAuthUserId();

    // 現在のユーザーが受け取って, 現在のユーザーが消去していない, 未読のmessageの個数を取得します。
    return prisma.message.count({
      where: {
        // 現在のユーザーが受け取ったmessageを取得します。
        recipientId: userId,
        // 未読のmessageを取得します。
        dateRead: null,
        // 現在のユーザーが消去してないmessageを取得します。
        recipientDeleted: false,
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
