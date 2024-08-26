'use client';

import { MessageDto } from '@/types';
import MessageBox from '@/app/members/[userId]/chat/MessageBox';
import { useCallback, useEffect, useRef, useState } from 'react';
import { pusherClient } from '@/lib/pusher';
import { formatShortDateTime } from '@/lib/util';
import { Channel } from 'pusher-js';

type Props = {
  initialMessages: MessageDto[];
  currentUserId: string;
  chatId: string;
};

// 99 (Receiving the live messages)
// 101 (Adding the read message feature)
const MessageList = ({ initialMessages, currentUserId, chatId }: Props) => {
  const setReadCount = useRef(false);
  // 1. useRefが使われているので、channelRef は、コンポーネントが再レンダリングされても、その中身（Pusherのチャンネル）を保持し続けます。
  //    通常の変数だと再レンダリングのたびに初期化されてしまいますが、useRefはその値を維持します。
  // 2. また、useRefの値を変更してもコンポーネントは再レンダリングされません。これは、UIに影響を与えない値（この場合はPusherチャンネル）を保存するのに適しています。
  //    UIに影響を与えない値とは、画面上に表示されるないものや、レンダリングに直接関係しないものです。
  const channelRef = useRef<Channel | null>(null);
  const [messages, setMessages] = useState(initialMessages);

  // この関数が props として子コンポーネントに渡される場合、useCallback() を使用することで、親コンポーネントが再レンダリングされても、
  // この関数が変更されないため、子コンポーネントの不要な再レンダリングを防げます。

  // handleNewMessage() は、サーバー側で messageActions.ts の createMessage() server actionで message:read イベントを
  // 発火させる際に作られたmessageをmessageDto型として受け取ります。
  const handleNewMessage = useCallback((message: MessageDto) => {
    setMessages((prevState) => {
      return [...prevState, message];
    });
  }, []);

  // handleReadMessages() は、サーバー側でmessageActions.tsの getMessageThread() server actionで message:read イベントを
  // 発火させる際に既読となったメッセージIDの配列(messageIds)を受け取ります。
  const handleReadMessages = useCallback((messageIds: string[]) => {
    setMessages((prevState) =>
      prevState.map((message) =>
        messageIds.includes(message.id)
          ? // 既読の場合、message オブジェクトのコピーを作成し、dateRead プロパティを現在の日時で更新します。
            { ...message, dateRead: formatShortDateTime(new Date()) }
          : // 既読でない場合、元の message をそのまま返します
            message,
      ),
    );
  }, []);

  // useEffect() は コンポーネントのレンダリング後に実行される処理を定義するために使用されます。
  // ここでは、Pusherチャンネルの購読とイベントのバインディングを行っています。
  // useEffect() を使うことで、コンポーネントのマウント時にチャンネルを購読し、アンマウント時に購読を解除するという、
  // ライフサイクルに沿った処理を簡潔に記述できます。
  // つまり、useEffect を使うことで、「コンポーネントが現れたときに開始し、消えるときに終了する」という一連の処理を簡単に書くことができます.
  useEffect(() => {
    if (!channelRef.current) {
      channelRef.current = pusherClient.subscribe(chatId);
      // サーバーがmessageActions.tsのcreateMessage() server actionを実行してメッセージを作成すると、
      // Pusherを通じて'message:new'イベントが発火されます。
      // クライアントサイド(このcomponent)では、このイベントをhandleNewMessage関数で捉え、UIを更新します。
      channelRef.current.bind('message:new', handleNewMessage);
      // サーバーがmessageActions.tsのgetMessageThread() server actionを実行してメッセージを作成すると、
      // Pusherを通じて'message:read'イベントが発火されます。
      // クライアントサイド(このcomponent)では、このイベントをhandleReadMessages関数で捉え、UIを更新します。
      channelRef.current.bind('message:read', handleReadMessages);
    }

    return () => {
      if (channelRef.current && channelRef.current.subscribed) {
        channelRef.current.unsubscribe();
        channelRef.current.unbind('message:new', handleNewMessage);
        channelRef.current.unbind('message:read', handleReadMessages);
      }
    };
  }, [chatId, handleNewMessage, handleReadMessages]);

  return (
    <div>
      {messages.length === 0 ? (
        'No messages to display.'
      ) : (
        <div>
          {messages.map((message) => (
            <MessageBox key={message.id} message={message} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageList;
