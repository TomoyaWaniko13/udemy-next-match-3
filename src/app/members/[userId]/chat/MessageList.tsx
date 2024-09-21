'use client';

import { MessageDto } from '@/types';
import MessageBox from '@/app/members/[userId]/chat/MessageBox';
import { useCallback, useEffect, useRef, useState } from 'react';
import { pusherClient } from '@/lib/pusher';
import { formatShortDateTime } from '@/lib/util';
import { Channel } from 'pusher-js';
import useMessageStore from '@/hooks/useMessageStore';

type Props = {
  // messages は スレッドに表示する messages です。
  // readCount は 既読になった messages の件数です。
  initialMessages: { messages: MessageDto[]; readCount: number };
  currentUserId: string;
  chatId: string;
};

// 99 (Receiving the live messages)
// 101 (Adding the read message feature)
// 114 (Updating the count based on the event)

// 特定のユーザーとのメッセージのスレッドを表示します。
// Pusherからの通知に応じて状態を変化させる必要があるので、client componentである必要があります。
const MessageList = ({ initialMessages, currentUserId, chatId }: Props) => {
  // useEffect()をstrict modeで2回実行させないためのlogicです。
  const setReadCount = useRef(false);

  // useState() でスレッドに表示するメッセージの状態を管理します。
  // これにより、Pusherからの通知でメッセージを追加できます。
  const [messages, setMessages] = useState(initialMessages.messages);

  // store の updateUnreadCount() では、Pusher の通知に応じて未読のメッセージの件数を更新します。
  // これにより、画面にその更新を反映できます。
  const { updateUnreadCount } = useMessageStore((state) => ({
    updateUnreadCount: state.updateUnreadCount,
  }));

  const channelRef = useRef<Channel | null>(null);

  // Pusher の event に応じて、既読になったメッセージの件数だけ、現在未読のメッセージの件数から引きます。
  useEffect(() => {
    // useEffect()をstrict modeで2回実行させないためのlogicです。
    if (!setReadCount.current) {
      // 既読になったメッセージの件数だけ、現在未読のメッセージの件数から引きます。
      updateUnreadCount(-initialMessages.readCount);
      // useEffect()をstrict modeで2回実行させないためのlogicです。
      setReadCount.current = true;
    }
  }, [initialMessages.readCount, updateUnreadCount]);

  // server side で新しいメッセージがデータベースに記録された時、
  // Pusher で通知が来るので、それに応じて client side で state を更新します。
  const handleNewMessage = useCallback((message: MessageDto) => {
    setMessages((prevState) => {
      return [...prevState, message];
    });
  }, []);

  // server side でスレッドに表示する messages が取得された時、
  // Pusher で通知が来るので、それに応じて client side で state を更新します。
  const handleReadMessages = useCallback((messageIds: string[]) => {
    setMessages((prevState) =>
      // 配列の各要素を加工したいので map を使います。
      prevState.map((message) =>
        messageIds.includes(message.id) ? { ...message, dateRead: formatShortDateTime(new Date()) } : message,
      ),
    );
    setMessages((prevState) =>
      prevState.map((message) =>
        messageIds.includes(message.id) ? { ...message, dateRead: formatShortDateTime(new Date()) } : message,
      ),
    );
  }, []);

  useEffect(() => {
    if (!channelRef.current) {
      channelRef.current = pusherClient.subscribe(chatId);
      channelRef.current.bind('message:new', handleNewMessage);
      channelRef.current.bind('messages:read', handleReadMessages);
    }

    return () => {
      if (channelRef.current && channelRef.current.subscribed) {
        channelRef.current.unsubscribe();
        channelRef.current.unbind('message:new', handleNewMessage);
        channelRef.current.unbind('messages:read', handleReadMessages);
      }
    };
    // useCallback()は、handleNewMessage()とhandleReadMessages()関数をメモ化（キャッシュ）します。
    // これにより、これらの関数は、依存配列が変更されない限り、再レンダリング時に再作成されません。

    // useEffect()の依存配列に、useCallback()でメモ化されたhandleNewMessage()と
    // handleReadMessages()が含まれています。
    // これにより、これらの関数が変更されない限り、useEffect()は再実行されません。
    // つまり、不要なPusherチャンネルの再購読や再バインディングを防ぎます。
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
