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
// 91 (Adding the message read functionality)
// 93 (Adding the delete message action)
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

    // 「現在のユーザーが受け取った、まだ既読になっていないメッセージを全て既読にする」という処理を行っています。
    // これにより、ユーザーがメッセージスレッドを開いたときに、相手からの未読メッセージが自動的に既読状態になります。
    if (messages.length > 0) {
      await prisma.message.updateMany({
        // senderId: recipientId : 送信者が、会話の相手（recipientId）であるメッセージ
        // recipientId: userId : 受信者がログインしている現在のユーザー（userId）であるメッセージ
        // dateRead: null : まだ既読になっていない（dateReadがnullの）メッセージ
        where: {
          senderId: recipientId,
          recipientId: userId,
          dateRead: null,
        },
        data: { dateRead: new Date() },
      });
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

// 93 (Adding the delete message action)
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
          OR: messagesToDelete.map((m) => ({ id: m.id })),
        },
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
