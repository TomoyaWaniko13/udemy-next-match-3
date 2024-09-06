import PresenceAvatar from '@/components/PresenceAvatar';
import { truncateString } from '@/lib/util';
import { Button } from '@nextui-org/react';
import { AiFillDelete } from 'react-icons/ai';
import { MessageDto } from '@/types';

type Props = {
  item: MessageDto;
  columnKey: string;
  isOutbox: boolean;
  deleteMessage: (message: MessageDto) => void;
  isDeleting: boolean;
};

// 110 (Refactoring the message table)
const MessageTableCell = ({ item, columnKey, isOutbox, deleteMessage, isDeleting }: Props) => {
  // この cellValue を使って各々の cell を作ります。
  // columnKey は列(column)の識別子で、'recipientName'（または 'senderName'）、
  //'text'、'created'、'actions' のいずれかです。
  const cellValue = item[columnKey as keyof MessageDto];

  // return の中が各々の cell となります。
  switch (columnKey) {
    // 送信者もしくは受信者の場合,user の画像、オンラインかどうか、user の名前を出力します。
    case 'recipientName':
    case 'senderName':
      return (
        <div className={`flex items-center gap-2 cursor-pointer `}>
          {/* 107 (Displaying presence in other components) */}
          <PresenceAvatar
            src={isOutbox ? item.recipientImage : item.senderImage}
            userId={isOutbox ? item.recipientId : item.senderId}
          />
          <span>{cellValue}</span>
        </div>
      );
    // 'text' の場合、message の内容を含んでいるので、その message を出力します。
    case 'text':
      return <div>{truncateString(cellValue)}</div>;
    // 'created' の場合、いつ,その message が作られたかを出力します。
    case 'created':
      return cellValue;
    // 'actions' の場合、deleteButton component を出力します。
    default:
      return (
        <Button isIconOnly={true} variant={'light'} onClick={() => deleteMessage(item)} isLoading={isDeleting}>
          <AiFillDelete size={24} className={'text-danger'} />
        </Button>
      );
  }
};

export default MessageTableCell;
