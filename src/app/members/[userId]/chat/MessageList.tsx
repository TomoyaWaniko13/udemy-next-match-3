'use client';

import { MessageDto } from '@/types';
import MessageBox from '@/app/members/[userId]/chat/MessageBox';
import { useCallback, useEffect, useRef, useState } from 'react';
import { pusherClient } from '@/lib/pusher';
import { formatShortDateTime } from '@/lib/util';
import { Channel } from 'pusher-js';
import useMessageStore from '@/hooks/useMessageStore';

// 99 (Receiving the live messages)
// 101 (Adding the read message feature)
// 114 (Updating the count based on the event)

type Props = {
  initialMessages: { messages: MessageDto[]; readCount: number };
  currentUserId: string;
  chatId: string;
};

const MessageList = ({ initialMessages, currentUserId, chatId }: Props) => {
  const [messages, setMessages] = useState(initialMessages.messages);
  const { updateUnreadCount } = useMessageStore((state) => ({
    updateUnreadCount: state.updateUnreadCount,
  }));
  const channelRef = useRef<Channel | null>(null);
  const setReadCount = useRef(false);

  useEffect(() => {
    if (!setReadCount.current) {
      updateUnreadCount(-initialMessages.readCount);
      setReadCount.current = true;
    }
  }, [initialMessages.readCount, updateUnreadCount]);

  const handleNewMessage = useCallback((message: MessageDto) => {
    setMessages((prevState) => [...prevState, message]);
  }, []);

  const handleReadMessages = useCallback((messageIds: string[]) => {
    setMessages((prevState) =>
      prevState.map((message) => (messageIds.includes(message.id) ? { ...message, dateRead: formatShortDateTime(new Date()) } : message)),
    );
  }, []);

  // Pusher チャンネルの購読を管理
  useEffect(() => {
    const subscribeToChannel = () => {
      channelRef.current = pusherClient.subscribe(chatId);
    };

    try {
      subscribeToChannel();
    } catch (error) {
      console.error('Failed to subscribe to Pusher channel:', error);
    }

    return () => {
      if (channelRef.current?.subscribed) {
        channelRef.current.unsubscribe();
      }
    };
  }, [chatId]);

  // 新しいメッセージのイベントリスナーを管理
  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.bind('message:new', handleNewMessage);

      return () => {
        channelRef.current?.unbind('message:new', handleNewMessage);
      };
    }
  }, [handleNewMessage]);

  // 既読メッセージのイベントリスナーを管理
  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.bind('messages:read', handleReadMessages);

      return () => {
        channelRef.current?.unbind('messages:read', handleReadMessages);
      };
    }
  }, [handleReadMessages]);

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
