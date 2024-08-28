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
  const cellValue = item[columnKey as keyof MessageDto];

  // returnの中が各々のcellとなる。
  switch (columnKey) {
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
    case 'text':
      return <div>{truncateString(cellValue)}</div>;
    case 'created':
      return cellValue;
    default:
      return (
        <Button isIconOnly={true} variant={'light'} onClick={() => deleteMessage(item)} isLoading={isDeleting}>
          <AiFillDelete size={24} className={'text-danger'} />
        </Button>
      );
  }
};

export default MessageTableCell;
