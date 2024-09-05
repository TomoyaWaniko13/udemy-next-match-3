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
  const cellValue = item[columnKey as keyof MessageDto];

  // returnの中が各々のcellとなります。
  switch (columnKey) {
    // 送信者もしくは受信者の場合,userの画像、オンラインかどうか、userの名前を出力します。
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
    // 'text' の場合、messageの内容を含んでいるので、そのmessageを出力します。
    case 'text':
      return <div>{truncateString(cellValue)}</div>;
    // 'created' の場合、いつそのmessageが作られたかを出力します。
    case 'created':
      return cellValue;
    // 'actions' の場合、deleteButton componentを出力します。
    default:
      return (
        <Button isIconOnly={true} variant={'light'} onClick={() => deleteMessage(item)} isLoading={isDeleting}>
          <AiFillDelete size={24} className={'text-danger'} />
        </Button>
      );
  }
};

export default MessageTableCell;
