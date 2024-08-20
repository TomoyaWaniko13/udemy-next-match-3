import { ZodIssue } from 'zod';
import { Prisma } from '@prisma/client';

type ActionResult<T> =
  // It can either be successful.
  // And if it is then we're going to return the data which is going to be of a certain type.
  // It's going to be a user, an array of users, an array of members, an array of messages.
  // Whatever the type is, that's what we're going to return.
  | { status: 'success'; data: T }

  // if we've got an error, then we're going to return a different kind of property,
  // an error that's going to be a string or it's going to be an array of Zod issues.
  | { status: 'error'; error: string | ZodIssue[] };

// 84 (Creating a message DTO)
// MessageWithSenderRecipient 型は、Prismaの型生成機能を利用して作成された型です。
// Messageモデルに対して特定の選択（select）を行った結果の型を生成します。
// Message modelのpropertyは全て選択されていないので,この MessageWithSenderRecipient 型を作ります。
// この型定義により、以下のような構造を持つオブジェクトの型が生成されます：
// {
//   id: string;
//   text: string;
//   created: Date;
//   dateRead: Date | null;
//   sender: {
//     userId: string;
//     name: string;
//     image: string | null;
//   };
//   recipient: {
//     userId: string;
//     name: string;
//     image: string | null;
//   };
// }
// Payloadは,データ通信においてヘッダーやメタデータなどの付随情報を除いた、核となる情報内容を表します.
type MessageWithSenderRecipient = Prisma.MessageGetPayload<{
  select: {
    id: true;
    text: true;
    created: true;
    dateRead: true;
    sender: { select: { userId; name; image } };
    recipient: { select: { userId; name; image } };
  };
}>;

// 84 (Creating a message DTO)
type MessageDto = {
  id: string;
  text: string;
  created: string;
  dateRead: string | null;
  // schema.prismaでsenderとrecipientをoptionalにしたので、以下のpropertiesもoptionalにする必要がある。
  senderId?: string;
  senderName?: string;
  senderImage?: string | null;
  recipientId?: string;
  recipientName?: string;
  recipientImage?: string | null;
};
