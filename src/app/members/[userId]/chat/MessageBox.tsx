import { MessageDto } from '@/types';
import clsx from 'clsx';
import { Avatar } from '@nextui-org/react';
import { transformImageUrl } from '@/lib/util';

type Props = {
  message: MessageDto;
  currentUserId: string;
};

// 85 (Displaying the messages )
const MessageBox = ({ message, currentUserId }: Props) => {
  // message.senderIdがログインしているユーザーのidかどうかチェックする。
  const isCurrentUserSender = message.senderId === currentUserId;

  const renderAvatar = () => {
    // returnをつける必要がある。
    return (
      <Avatar
        name={message.senderName}
        className={'self-end'}
        src={transformImageUrl(message.senderImage) || '/images/user.png'}
      />
    );
  };

  return (
    <div className={'grid grid-rows-1'}>
      <div
        className={clsx('flex gap-2 mb-3', {
          // messageを送ったのが、ログインしているユーザーのidである場合, 'justify-end text-right'が適用される。
          'justify-end text-right': isCurrentUserSender,
          //　messageを送ったのが、ログインしているユーザーのidでない場合, 'justify-start'が適用される。
          'justify-start': !isCurrentUserSender,
        })}
      >
        {!isCurrentUserSender && renderAvatar()}
        <div>Message content</div>
        {isCurrentUserSender && renderAvatar()}
      </div>
    </div>
  );
};

export default MessageBox;
