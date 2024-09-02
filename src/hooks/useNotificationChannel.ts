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

// ユーザーIDを引数として受け取ります。
// このIDを使用して、private-{userId}という形式のプライベートチャンネルを作成します。
export const useNotificationChannel = (userId: string | null) => {
  // useRef を使用して、チャンネルのインスタンスを保持します。
  // これにより、不必要な再購読を避け、パフォーマンスを向上させます。
  const channelRef = useRef<Channel | null>(null);

  // URLのパス部分（ドメイン名の後のパス）を取得します。
  // 例えば、URL が "https://example.com/blog/post?id=1" の場合、usePathname() は "/blog/post" を返します。
  // パスの変更を監視し、変更があった場合にコンポーネントを再レンダリングします。
  const pathname = usePathname();

  // URLのクエリパラメータ（?以降の部分）にアクセスするためのメソッドを提供します。
  // 例えば、URL が "https://example.com/blog/post?id=1&category=tech" の場合、
  // useSearchParams().get('id') は "1" を、useSearchParams().get('category') は "tech" を返します。
  // クエリパラメータの変更を監視し、変更があった場合にコンポーネントを再レンダリングします。
  const searchParams = useSearchParams();

  const { add, updateUnreadCount } = useMessageStore((state) => ({
    add: state.add,
    updateUnreadCount: state.updateUnreadCount,
  }));

  // handleNewMessage() 関数は、新しいメッセージを受信したときに呼び出されます。
  // 新しいメッセージを受信すると、useMessageStore の add 関数を使用して即座に状態を更新します。
  // これにより、UIが自動的に再レンダリングされ、新しいメッセージが表示されます。
  // ユーザーが /messages ページにいて、かつ送信済みメッセージ（outbox）を表示していない場合にのみ、
  // 新しいメッセージをリストに追加します。これにより、適切なコンテキストでのみ更新が行われます。
  const handleNewMessage = useCallback(
    (message: MessageDto) => {
      // ユーザーが '/messages' ページにいて、かつ 'outbox' （送信済みメッセージ）を表示していない場合、
      // つまり 'inbox'(受信済みメッセージ)を表示している場合、新しいメッセージをリストに追加します。
      // さらに、messageStoreのupdateUnreadCount()で未読のメッセージの件数を+1します。
      // これにより、ユーザーがメッセージ一覧画面にいる場合、リロードなしで新しいメッセージがリアルタイムで表示されます。
      if (pathname === '/messages' && searchParams.get('container') !== 'outbox') {
        add(message);
        updateUnreadCount(1);

        // ユーザーが送信者とのチャットページにいない場合、トースト通知で新しいメッセージの到着を知らせます。
        // さらに、messageStoreのupdateUnreadCount()で未読のメッセージの件数を+1します。
        // これにより、ユーザーが関連するチャット画面を見ていない場合、新しいメッセージの到着を通知で知らせます。
      } else if (pathname !== `/members/${message.senderId}/chat`) {
        newMessageToast(message);
        updateUnreadCount(1);
      }
    },
    [add, pathname, searchParams, updateUnreadCount],
  );

  const handleNewLike = useCallback((data: { name: string; image: string | null; userId: string }) => {
    newLikeToast(data.name, data.image, data.userId);
  }, []);

  useEffect(() => {
    // https://react.dev/reference/react/useEffect
    // useEffect () は conditionの中で呼び出せないので、
    // if (!userId) return; は useEffect()の中で使う必要があります。
    if (!userId) return;

    // コンポーネントがマウントされたときに、指定されたプライベートチャンネルをsubscribe()します。
    // そのsubscribe()の後で、/api/pusher-auth/route.tsのauthorizationが発生します。
    // 下のURLのwebpageの図に実行順が書かれています。
    // https://pusher.com/docs/channels/server_api/authorizing-users/
    if (!channelRef.current) {
      // https://pusher.com/docs/channels/using_channels/private-channels/
      // private channel の名前は private- で始める必要があります。
      // これにより、サーバーからクライアントへ即座にデータを送信できます。
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
  }, [userId, handleNewMessage]);
};
