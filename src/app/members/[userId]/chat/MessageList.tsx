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
  const channelRef = useRef<Channel | null>(null);
  const [messages, setMessages] = useState(initialMessages);

  // この関数が props として子コンポーネントに渡される場合、useCallback() を使用することで、親コンポーネントが再レンダリングされても、
  // この関数が変更されないため、子コンポーネントの不要な再レンダリングを防げます。
  const handleNewMessage = useCallback((message: MessageDto) => {
    setMessages((prevState) => {
      return [...prevState, message];
    });
  }, []);

  const handleReadMessages = useCallback((messageIds: string[]) => {
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
