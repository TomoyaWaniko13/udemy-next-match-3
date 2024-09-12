import { Channel } from 'pusher-js';
import { useCallback, useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher';
import { MessageDto } from '@/types';
import { usePathname, useSearchParams } from 'next/navigation';
import useMessageStore from '@/hooks/useMessageStore';
import { newLikeToast, newMessageToast } from '@/components/NotificationToast';

// 108 (Setting up a private channel)
// 111 (Adding the realtime functionality to the message table)
// 114 (Updating the count based on the event)
// 116 (Challenge solution)

// このuserIdを使用して、private-{userId}という形式のプライベートチャンネルを作成します。
// プライベートチャンネルを使用することで、特定のユーザーにのみメッセージの通知を送信できます。
export const useNotificationChannel = (userId: string | null, profileComplete: boolean) => {
  const channelRef = useRef<Channel | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { add, updateUnreadCount } = useMessageStore((state) => ({
    add: state.add,
    updateUnreadCount: state.updateUnreadCount,
  }));

  // handleNewMessage() 関数は、下のuseEffect()で呼び出されます。
  const handleNewMessage = useCallback(
    (message: MessageDto) => {
      if (pathname === '/messages' && searchParams.get('container') !== 'outbox') {
        add(message);
        updateUnreadCount(1);
        //
      } else if (pathname !== `/members/${message.senderId}/chat`) {
        newMessageToast(message);
        updateUnreadCount(1);
      }
    },
    [add, pathname, searchParams, updateUnreadCount],
  );

  // 116 (Challenge solution)
  // 下のuseEffect()で呼び出されます。
  const handleNewLike = useCallback((data: { name: string; image: string | null; userId: string }) => {
    newLikeToast(data.name, data.image, data.userId);
  }, []);

  useEffect(() => {
    if (!userId || !profileComplete) return;
    // コンポーネントがマウントされたときに、指定されたプライベートチャンネルをsubscribe()します。
    // そのsubscribe()の後で、/api/pusher-auth/route.tsのauthorizationが発生します。
    // 下のURLのwebpageの図に実行順が書かれています。
    // https://pusher.com/docs/channels/server_api/authorizing-users/

    if (!channelRef.current) {
      // https://pusher.com/docs/channels/using_channels/private-channels/
      // private-${userId} という形式のプライベートチャンネルを使用することで、
      // 特定のユーザーにのみメッセージを送信できます。
      channelRef.current = pusherClient.subscribe(`private-${userId}`);
      channelRef.current.bind('message:new', handleNewMessage);
      channelRef.current.bind('like:new', handleNewLike);
    }

    // コンポーネントがアンマウントされたときに、チャンネルの購読を解除します。
    return () => {
      if (channelRef.current && channelRef.current?.subscribed) {
        channelRef.current?.unsubscribe();
        channelRef.current.unbind('message:new', handleNewMessage);
        channelRef.current.unbind('like:new', handleNewLike);
        channelRef.current = null;
      }
    };
  }, [userId, handleNewMessage, handleNewLike, profileComplete]);
};
