'use client';

import { MessageDto } from '@/types';
import clsx from 'clsx';
import { timeAgo, transformImageUrl } from '@/lib/util';
import { useEffect, useRef } from 'react';
import PresenceAvatar from '@/components/PresenceAvatar';

type Props = {
  message: MessageDto;
  currentUserId: string;
};

// 85 (Displaying the messages )
// 86 (Displaying the messages Part 2)
// 87 (Improving the message box)
// 101 (Adding the read message feature)
// 107 (Displaying presence in other components)

// members/[userId]/chat で使われる、スレッドのメッセージに背景色を追加したものです。
const MessageBox = ({ message, currentUserId }: Props) => {
  // 現在のユーザーがメッセージの送信者かチェックします。
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
    // if (messageEndRef.current) のチェックは、DOM 要素が実際に存在することを確認しています。
    if (messageEndRef.current) {
      // scrollIntoView() メソッドは DOM API の一部で指定された要素が表示されるように、コンテナ（この場合はブラウザウィンドウ）をスクロールします。
      // { behavior: 'smooth' } オプションは、スクロールをスムーズなアニメーションで行うように指定しています。
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageEndRef]);

  // メッセージを送ったユーザーがオンラインかどうか表示します。
  const renderAvatar = () => {
    // 107 (Displaying presence in other components)
    return (
      <div className={'self-end'}>
        <PresenceAvatar src={transformImageUrl(message.senderImage) || '/images/user.png'} userId={message.senderId} />
      </div>
    );
  };

  // renderMessageContent() の中で使われます。
  // メッセージの背景色を変えます。
  const messageContentClasses = clsx('flex flex-col w-[50%] px-2 py-1', {
    // messageを送ったのが、ログインしているユーザーである場合, 背景を青にします。
    'rounded-l-xl rounded-tr-xl text-white bg-blue-100': isCurrentUserSender,
    // messageを送ったのが、ログインしているユーザーでない場合, 背景を緑にします。
    'rounded-r-xl rounded-tl-xl border-gray-200 bg-green-100': !isCurrentUserSender,
  });

  // renderMessageContent()の中で使われます。
  // メッセージが読まれた日時、送信者の名前、作成日時を表示します。
  const renderMessageHeader = () => {
    return (
      <div className={clsx('flex items-center w-full', { 'justify-between': isCurrentUserSender })}>
        {/* 既読で, 受信者が現在のユーザーでない場合、いつ message が読まれたか表示します。 */}
        {message.dateRead && message.recipientId !== currentUserId ? (
          <span className={'text-xs text-black text-italic'}>(Read {timeAgo(message.dateRead)})</span>
        ) : (
          <div></div>
        )}
        {/*横並びにします。*/}
        <div className={'flex'}>
          <span className={'text-sm font-semibold text-gray-900'}>{message.senderName}</span>
          <span className={'text-sm text-gray-500 ml-2'}>{message.created}</span>
        </div>
      </div>
    );
  };

  // メッセージを表示します。
  const renderMessageContent = () => {
    return (
      // メッセージの背景色を変えます。
      <div className={messageContentClasses}>
        {/* メッセージが読まれた日時、送信者の名前、作成日時を表示します。　*/}
        {renderMessageHeader()}
        {/* メッセージの本文を表示します。　*/}
        <p className={'text-sm py-3 text-gray-900'}>{message.text}</p>
      </div>
    );
  };

  return (
    // grid を使います。
    <div className={'grid grid-rows-1'}>
      {/* 'flex gap-2 mb-3' は常に適用される。 */}
      <div
        className={clsx('flex gap-2 mb-3', {
          // message を送ったのが現在のユーザーのである場合、message を画面の右側に表示する。
          'justify-end text-right': isCurrentUserSender,
          // message を送ったのが現在のユーザーでない場合, message を画面の左側に表示する。
          'justify-start': !isCurrentUserSender,
        })}
      >
        {/* messageを送ったのが、ログインしているユーザーでない場合, メッセージの左側にアバターを表示します。 */}
        {!isCurrentUserSender && renderAvatar()}
        {renderMessageContent()}
        {/* messageを送ったのが、ログインしているユーザーである場合, メッセージの右側にアバターを表示します。 */}
        {isCurrentUserSender && renderAvatar()}
      </div>
      <div ref={messageEndRef} />
    </div>
  );
};

export default MessageBox;
