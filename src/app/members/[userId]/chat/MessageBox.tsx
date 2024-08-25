'use client';

import { MessageDto } from '@/types';
import clsx from 'clsx';
import { Avatar, divider } from '@nextui-org/react';
import { timeAgo, transformImageUrl } from '@/lib/util';
import { useEffect, useRef } from 'react';

type Props = {
  message: MessageDto;
  currentUserId: string;
};

// 85 (Displaying the messages )
// 86 (Displaying the messages Part 2)
// 87 (Improving the message box)
// 101 (Adding the read message feature)
const MessageBox = ({ message, currentUserId }: Props) => {
  // message.senderIdがログインしているユーザーのidかどうか、つまり
  // ログインしているユーザーがmessageの送信者かチェックする。
  const isCurrentUserSender = message.senderId === currentUserId;

  // React の useRef フックを使用して、DOM 要素への参照を作成しています。
  // <HTMLDivElement> は TypeScript の型注釈で、この ref が HTML の <div> 要素を参照することを指定しています。
  // null を初期値として渡しています。これは、コンポーネントが最初にレンダリングされる時点では、まだ DOM 要素が存在しないためです。
  // messageEndRefは、メッセージリストの最後に配置された空のdiv要素を参照します。
  const messageEndRef = useRef<HTMLDivElement>(null);

  // レンダリングプロセス中にDOMを直接操作すると、Reactの差分計算や更新プロセスと競合する可能性があります。
  // これにより、予期しない動作や、パフォーマンスの低下、さらにはエラーが発生する可能性があります。
  // なので、DOMの操作（ここではスクロール）はレンダリング完了後に行う必要があります。
  // useEffectは、コンポーネントがレンダリングされた後に実行されます.
  // 非同期の性質：メッセージの追加やDOMの更新が非同期で行われる可能性があるため、それらが完了した後にスクロールを調整する必要があります。
  useEffect(() => {
    // useRef によって作成された ref オブジェクトの current プロパティは、その ref が参照している実際の DOM 要素を指します。
    //　if (messageEndRef.current) のチェックは、DOM 要素が実際に存在することを確認しています。

    // scrollIntoView() メソッドは DOM API の一部で指定された要素が表示されるように、コンテナ（この場合はブラウザウィンドウ）をスクロールします。
    // { behavior: 'smooth' } オプションは、スクロールをスムーズなアニメーションで行うように指定しています。
    if (messageEndRef.current) messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messageEndRef]);

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
    // messageを送ったのが、ログインしているユーザーである場合, 'rounded-l-xl rounded-tr-xl text-white bg-blue-100'が適用される。
    // つまり、背景を青にする。
    'rounded-l-xl rounded-tr-xl text-white bg-blue-100': isCurrentUserSender,
    // messageを送ったのが、ログインしているユーザーでない場合, 'rounded-r-xl rounded-tl-xl border-gray-200 bg-green-100'が適用される。
    // つまり、背景を緑にする
    'rounded-r-xl rounded-tl-xl border-gray-200 bg-green-100': !isCurrentUserSender,
  });

  // renderMessageContent()の中で使われる。
  const renderMessageHeader = () => {
    return (
      <div className={clsx('flex items-center w-full', { 'justify-between': isCurrentUserSender })}>
        {/* messageが既読で,ログインしているuserがmessageの受信者でない場合、いつmessageが読まれたか表示する。 */}
        {message.dateRead && message.recipientId !== currentUserId ? (
          <span className={'text-xs text-black text-italic'}>(Read {timeAgo(message.dateRead)})</span>
        ) : (
          <div></div>
        )}
        {/*横並びにする。*/}
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
          // messageを送ったのが、ログインしているユーザーのである場合, 'justify-end text-right'が適用される。
          // つまり、messageを画面の右側に表示する。
          'justify-end text-right': isCurrentUserSender,
          //　messageを送ったのが、ログインしているユーザーでない場合, 'justify-start'が適用される。
          // つまり、messageを画面の左側に表示する。
          'justify-start': !isCurrentUserSender,
        })}
      >
        {/* messageを送ったのが、ログインしているユーザーでない場合, メッセージの左側にアバターを表示 */}
        {!isCurrentUserSender && renderAvatar()}
        {renderMessageContent()}
        {/* messageを送ったのが、ログインしているユーザーである場合, メッセージの右側にアバターを表示 */}
        {isCurrentUserSender && renderAvatar()}
      </div>
      <div ref={messageEndRef} />
    </div>
  );
};

export default MessageBox;
