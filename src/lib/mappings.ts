import { formatShortDateTime } from '@/lib/util';
import { MessageWithSenderRecipient } from '@/types';

// 84 (Creating a message DTO)
export function mapMessageToMessageDto(message: MessageWithSenderRecipient) {
  return {
    id: message.id,
    text: message.text,
    // 18 Aug 24 3:30:PM　というふうにフォーマットされます。
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
