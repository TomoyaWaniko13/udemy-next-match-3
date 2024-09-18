import PresenceAvatar from '@/components/PresenceAvatar';
import { truncateString } from '@/lib/util';
import { Button, ButtonProps, useDisclosure } from '@nextui-org/react';
import { AiFillDelete } from 'react-icons/ai';
import { MessageDto } from '@/types';
import AppModal from '@/components/AppModal';

// 110 (Refactoring the message table)
// 167. Adding a modal

type Props = {
  item: MessageDto;
  columnKey: string;
  isOutbox: boolean;
  deleteMessage: (message: MessageDto) => void;
  isDeleting: boolean;
};

// メッセージ一覧の1つの行(row)に表示される各々のCellを作ります。
const MessageTableCell = ({ item, columnKey, isOutbox, deleteMessage, isDeleting }: Props) => {
  // item は messageDto 型です。
  // columnKey は列(column)の識別子で、'recipientName'（または 'senderName'）、
  //'text'、'created'、'actions' のいずれかです。
  const cellValue = item[columnKey as keyof MessageDto];

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onConfirmDeleteMessage = () => {
    deleteMessage(item);
  };

  const footerButtons: ButtonProps[] = [
    { color: 'default', onClick: onClose, children: 'Cancel' },
    { color: 'secondary', onClick: onConfirmDeleteMessage, children: 'Confirm' },
  ];

  // return の中が1つの行(row)に表示される各々のCellとなります。
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
    case 'text':
      return <div>{truncateString(cellValue)}</div>;
    case 'created':
      return <div>{cellValue}</div>;
    default:
      return (
        <>
          <Button isIconOnly={true} variant={'light'} onClick={() => onOpen()} isLoading={isDeleting}>
            <AiFillDelete size={24} className={'text-danger'} />
          </Button>
          <AppModal
            isOpen={isOpen}
            onClose={onClose}
            header={'Please confirm this action'}
            body={<div>Are you sure you want to delete this message? This cannot be undone.</div>}
            footerButtons={footerButtons}
          />
        </>
      );
  }
};

export default MessageTableCell;
