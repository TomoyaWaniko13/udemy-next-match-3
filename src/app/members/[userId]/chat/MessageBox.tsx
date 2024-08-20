import { MessageDto } from '@/types';
import clsx from 'clsx';
import { Avatar, divider } from '@nextui-org/react';
import { transformImageUrl } from '@/lib/util';

type Props = {
  message: MessageDto;
  currentUserId: string;
};

// 85 (Displaying the messages )
// 86 (Displaying the messages Part 2)
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

  // 'flex flex-col w-[50%] px-2 py-1'は常に適用される。
  const messageContentClasses = clsx('flex flex-col w-[50%] px-2 py-1', {
    // messageを送ったのが、ログインしているユーザーのidである場合, 'rounded-l-xl rounded-tr-xl text-white bg-blue-100'が適用される。
    'rounded-l-xl rounded-tr-xl text-white bg-blue-100': isCurrentUserSender,
    //　messageを送ったのが、ログインしているユーザーのidでない場合, 'rounded-r-xl rounded-tl-xl border-gray-200 bg-green-100'が適用される。
    'rounded-r-xl rounded-tl-xl border-gray-200 bg-green-100': !isCurrentUserSender,
  });

  // renderMessageContent()の中で使われる。
  const renderMessageHeader = () => {
    return (
      <div className={clsx('flex items-center w-full', { 'justify-between': isCurrentUserSender })}>
        {/* messageが既読で,ログインしているuserがmessageの受信者でない場合 */}
        {message.dateRead && message.recipientId !== currentUserId ? (
          <span className={'text-xs text-black text-italic'}>(Read 4 mins ago)</span>
        ) : (
          <div></div>
        )}
        <div className={'flex'}>
          <span className={'text-sm font-semibold text-gray-900'}>{message.senderName}</span>
          <span className={'text-sm text-gray-500 ml-2'}>{message.created}</span>
        </div>
      </div>
    );
  };

  const renderMessageContent = () => {
    return (
      <div className={messageContentClasses}>
        {renderMessageHeader()}
        <p className={'text-sm py-3 text-gray-900'}>{message.text}</p>
      </div>
    );
  };

  return (
    <div className={'grid grid-rows-1'}>
      {/* 'flex gap-2 mb-3' は常に適用される。 */}
      <div
        className={clsx('flex gap-2 mb-3', {
          // messageを送ったのが、ログインしているユーザーのidである場合, 'justify-end text-right'が適用される。
          'justify-end text-right': isCurrentUserSender,
          //　messageを送ったのが、ログインしているユーザーのidでない場合, 'justify-start'が適用される。
          'justify-start': !isCurrentUserSender,
        })}
      >
        {/* messageを送ったのが、ログインしているユーザーのidでない場合, メッセージの左側にアバターを表示 */}
        {!isCurrentUserSender && renderAvatar()}
        {renderMessageContent()}
        {/* messageを送ったのが、ログインしているユーザーのidである場合, メッセージの右側にアバターを表示 */}
        {isCurrentUserSender && renderAvatar()}
      </div>
    </div>
  );
};

export default MessageBox;
