import { Channel } from 'pusher-js';
import { useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher';

// 108 (Setting up a private channel)
// このフックを使用することで、アプリケーション内で特定のユーザーに対してリアルタイムの通知を送信できるようになります。
// 例えば、新しいメッセージの受信、フレンドリクエスト、またはその他のユーザー固有のイベントなどを通知することができます。

// ユーザーIDを引数として受け取ります。
// このIDを使用して、private-{userId}という形式のプライベートチャンネルを作成します。
export const useNotificationChannel = (userId: string | null) => {
  // useRefを使用して、チャンネルのインスタンスを保持します。
  // これにより、不必要な再購読を避け、パフォーマンスを向上させます。
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!userId) return;

    // コンポーネントがマウントされたときに、指定されたプライベートチャンネルを購読します。
    if (!channelRef.current) {
      // private channel の名前は private- で始める必要があります。
      // https://pusher.com/docs/channels/using_channels/private-channels/
      channelRef.current = pusherClient.subscribe(`private-${userId}`);
    }

    // コンポーネントがアンマウントされたときに、チャンネルの購読を解除します。
    return () => {
      if (channelRef.current) {
        channelRef.current?.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [userId]);
};
