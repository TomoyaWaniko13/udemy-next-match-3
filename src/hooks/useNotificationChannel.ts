import { Channel } from 'pusher-js';
import { useCallback, useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher';
import { MessageDto } from '@/types';
import { usePathname, useSearchParams } from 'next/navigation';
import useMessageStore from '@/hooks/useMessageStore';
import { newMessageToast } from '@/components/NewMessageToast';

// 108 (Setting up a private channel)
// 111 (Adding the realtime functionality to the message table)

// リアルタイムでリロードなしでメッセージを更新できる仕組みは、いくつかの重要な要素が組み合わさって実現されています。以下に主な理由を説明します：
// 1. Pusherを使用したリアルタイム通信:
//    `useNotificationChannel` フックでは、Pusherクライアントを使用してリアルタイムの通信チャンネルを確立しています。
//    これにより、サーバーからクライアントへ即座にデータを送信できます。
//
// 2. プライベートチャンネルの使用:
//    `private-${userId}` という形式のプライベートチャンネルを使用することで、特定のユーザーにのみメッセージを送信できます。
//
// 3. Zustandを使用した状態管理:
//    `useMessageStore` は Zustand を使用して作成されたカスタムフックです。これにより、
//     アプリケーション全体で一貫したメッセージの状態を管理できます。
//
// 4. リアルタイムイベントの処理:
//    `useNotificationChannel` 内の `handleNewMessage` 関数は、新しいメッセージを受信したときに呼び出されます。
//     この関数は、現在のページやパラメータに応じて適切なアクションを実行します。
//
// 5. 状態の即時更新:
//    新しいメッセージを受信すると、`useMessageStore` の `add` 関数を使用して即座に状態を更新します。
//    これにより、UIが自動的に再レンダリングされ、新しいメッセージが表示されます。
//
// 6. 条件付きの更新:
//    ユーザーが `/messages` ページにいて、かつ送信済みメッセージ（outbox）を表示していない場合にのみ、
//    新しいメッセージをリストに追加します。これにより、適切なコンテキストでのみ更新が行われます。
//
// 7. Reactの状態と副作用の利用:
//    `useEffect` と `useCallback` を使用して、コンポーネントのライフサイクルに応じてチャンネルの購読と解除を管理しています。
//
// 8. コンポーネントの自動再レンダリング:
//    Zustand ストアの状態が変更されると、その状態を使用しているコンポーネント（この場合は `MessageTable`）
//    が自動的に再レンダリングされ、新しいメッセージが表示されます。
//
// これらの要素が組み合わさることで、ユーザーがページをリロードすることなく、リアルタイムでメッセージの更新を見ることができるのです。
// サーバーからの新しいメッセージは即座にクライアントに送信され、アプリケーションの状態が更新され、それに応じてUIが自動的に更新されます。

// ユーザーIDを引数として受け取ります。
// このIDを使用して、private-{userId}という形式のプライベートチャンネルを作成します。
export const useNotificationChannel = (userId: string | null) => {
  // useRefを使用して、チャンネルのインスタンスを保持します。
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

  const { add } = useMessageStore((state) => ({ add: state.add }));

  // handleNewMessage() 関数は、新しいメッセージを受信したときに呼び出されます。
  // 新しいメッセージを受信すると、useMessageStore の add 関数を使用して即座に状態を更新します。
  // これにより、UIが自動的に再レンダリングされ、新しいメッセージが表示されます。
  // ユーザーが /messages ページにいて、かつ送信済みメッセージ（outbox）を表示していない場合にのみ、
  // 新しいメッセージをリストに追加します。これにより、適切なコンテキストでのみ更新が行われます。
  const handleNewMessage = useCallback(
    (message: MessageDto) => {
      // ユーザーが '/messages' ページにいて、かつ 'outbox' （送信済みメッセージ）を表示していない場合、
      // つまり 'inbox'(受信済みメッセージ)を表示している場合、新しいメッセージをリストに追加します。
      // これにより、ユーザーがメッセージ一覧画面にいる場合、リロードなしで新しいメッセージがリアルタイムで表示されます。
      if (pathname === '/messages' && searchParams.get('container') !== 'outbox') {
        add(message);

        // ユーザーが送信者とのチャットページにいない場合、トースト通知で新しいメッセージの到着を知らせます。
        // これにより、ユーザーが関連するチャット画面を見ていない場合、新しいメッセージの到着を通知で知らせます。
      } else if (pathname !== `/members/${message.senderId}/chat`) {
        newMessageToast(message);
      }
    },
    [add, pathname, searchParams],
  );

  useEffect(() => {
    if (!userId) return;

    // コンポーネントがマウントされたときに、指定されたプライベートチャンネルを購読します。
    if (!channelRef.current) {
      // https://pusher.com/docs/channels/using_channels/private-channels/
      // private channel の名前は private- で始める必要があります。
      // これにより、サーバーからクライアントへ即座にデータを送信できます。
      // private-${userId} という形式のプライベートチャンネルを使用することで、
      // 特定のユーザーにのみメッセージを送信できます。
      channelRef.current = pusherClient.subscribe(`private-${userId}`);
      channelRef.current.bind('message:new', handleNewMessage);
    }

    // コンポーネントがアンマウントされたときに、チャンネルの購読を解除します。
    return () => {
      if (channelRef.current) {
        channelRef.current?.unsubscribe();
        channelRef.current.unbind('message:new', handleNewMessage);

        channelRef.current = null;
      }
    };
  }, [userId, handleNewMessage]);
};
