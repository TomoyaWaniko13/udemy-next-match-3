import { Message } from '@prisma/client';
import { formatShortDateTime } from '@/lib/util';
import { MessageWithSenderRecipient } from '@/types';

// 84 (Creating a message DTO)
// mapMessageToMessageDto() 関数の主な目的は、データベースから取得したメッセージオブジェクト（MessageWithSenderRecipient型）を、
// フロントエンドで使用しやすい形式（MessageDto型),　つまりネストされたオブジェクトを持たない、フラットな構造に変換することです。
// 例えば、この関数によって以下のような変換が行われます
// // 変換前(ネストされたobjectを持つ)
// {
//   id: "1",
//   text: "Hello",
//   created: Date(2023-08-18T15:30:00),
//   dateRead: null,
//   sender: { userId: "user1", name: "Alice", image: "alice.jpg" },
//   recipient: { userId: "user2", name: "Bob", image: "bob.jpg" }
// }
//
// // 変換後(ネストされたobjectを持たない)
// {
//   id: "1",
//   text: "Hello",
//   created: "18 Aug 23 3:30:PM",
//   dateRead: null,
//   senderId: "user1",
//   senderName: "Alice",
//   senderImage: "alice.jpg",
//   recipientId: "user2",
//   recipientName: "Bob",
//   recipientImage: "bob.jpg"
// }
export function mapMessageToMessageDto(message: MessageWithSenderRecipient) {
  return {
    id: message.id,
    text: message.text,
    // 18 Aug 24 3:30:PM　というふうにformatされる。
    created: formatShortDateTime(message.created),
    dateRead: message.dateRead ? formatShortDateTime(message.dateRead) : null,
    // sender objectにアクセスする。
    senderId: message.sender?.userId,
    senderName: message.sender?.name,
    senderImage: message.sender?.image,
    // recipient objectにアクセスする。
    recipientId: message.recipient?.userId,
    recipientImage: message.recipient?.image,
    recipientName: message.recipient?.name,
  };
}
