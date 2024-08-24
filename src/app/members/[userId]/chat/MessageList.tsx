'use client';

import { MessageDto } from '@/types';
import MessageBox from '@/app/members/[userId]/chat/MessageBox';
import { useCallback, useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';

type Props = {
  // initialMessages: サーバーサイドで取得した初期メッセージ一覧
  // ChatPageコンポーネント（親）はサーバーサイドでレンダリングされています。ここで getMessageThread() を使用して初期メッセージを取得しています。
  // これにより、ページの初期ロード時に既存のメッセージをすぐに表示できます。
  // ユーザーがページを開いたときに、すぐにメッセージが表示されます。
  // クライアントサイドで再度APIリクエストを行う必要がないため、初期ロード時間が短縮されます。
  initialMessages: MessageDto[];
  // currentUserId: 現在のユーザーID
  currentUserId: string;
  // chatId: チャットルームのID
  chatId: string;
};

// 99 (Receiving the live messages)
// このコンポーネントの主な目的は、チャットアプリケーションにおけるメッセージリストを管理し、リアルタイムで更新することです。
// 具体的には以下の機能を提供しています：
// 初期メッセージの表示:
// サーバーサイドで取得した初期メッセージ（initialMessages）を表示します。
// これにより、ページロード時に既存のメッセージがすぐに表示されます。
//
// リアルタイムメッセージの受信と表示:
// Pusherを使用して、新しいメッセージをリアルタイムで受信します。
// 新しいメッセージを受信すると、即座にメッセージリストを更新します。
//
// メッセージの状態管理:
// ReactのuseStateフックを使用して、メッセージの状態を管理します。
// 新しいメッセージを受信すると、既存のメッセージリストに追加します。
//
// 効率的な更新処理:
// useCallbackフックを使用して、メッセージ更新関数を最適化します。
// 状態更新時に関数を使用することで、常に最新の状態を基に更新を行います。
//
// クリーンアップ処理:
// コンポーネントのアンマウント時に、Pusherのサブスクリプションとイベントリスナーを適切に解除します。
// これにより、メモリリークを防ぎ、不要なネットワーク接続を避けます。
//
// メッセージの表示:
// 各メッセージをMessageBoxコンポーネントを使用して表示します。
// メッセージがない場合は、適切なメッセージを表示します。
const MessageList = ({ initialMessages, currentUserId, chatId }: Props) => {
  // useState(initialMessages) は、コンポーネントの初期レンダリング時に initialMessages の値で状態を初期化します。
  // これにより、親コンポーネント（ChatPage）から渡された初期メッセージがすぐに表示されます。
  const [messages, setMessages] = useState(initialMessages);

  // React では、コンポーネントの props や state が変更されると再レンダリングが発生します。
  // 関数も毎回新しく作成されるため、子コンポーネントに渡すと不要な再レンダリングの原因になる可能性があります。
  // useCallback() を使用することで、依存配列が変更されない限り同じ関数インスタンスを再利用できます。

  // 新しいメッセージを受け取ると、setMessages を使用して状態を更新します。
  // 更新は前回の状態（prevState）を基に行われ、新しいメッセージが追加されます。
  const handleNewMessage = useCallback((message: MessageDto) => {
    // setMessages() に関数を渡している主な理由は、状態の更新が確実に最新の状態を基に行われるようにするためです。以下に詳しく説明します：
    // 状態の非同期更新:
    // React の状態更新は非同期で行われます。つまり、setMessages() を呼び出した直後に新しい状態が反映されるわけではありません。
    // 複数の更新の問題:
    // もし複数の更新が短時間に連続して行われた場合、単に新しい値を直接セットすると、一部の更新が失われる可能性があります。
    // 最新の状態を保証:
    // 関数を渡すことで、React は必ず最新の状態を関数に渡します。これにより、常に最新の状態を基に更新が行われることが保証されます。
    // 競合状態の回避:
    // 非同期操作や複数の更新が同時に行われる場合でも、この方法を使えば各更新が確実に前の状態を考慮して行われます。
    //
    // この方法では、複数の更新が行われた場合に問題が発生する可能性があります:
    // setMessages([...messages, newMessage]);
    //
    // この方法なら、常に最新の状態を基に更新が行われます:
    // setMessages((prevMessages) => [...prevMessages, newMessage]);

    // 2番目の方法（関数を使用する方法）では、prevMessages が必ず最新の状態であることが保証されます。
    // これにより、複数のメッセージが短時間に連続して追加された場合でも、すべてのメッセージが確実に追加されます。
    // このアプローチは、特に非同期操作や複雑な状態更新を扱う場合に重要です。メッセージングアプリのような、
    // 頻繁に状態が更新される可能性のあるアプリケーションでは、この方法が特に有効です。
    setMessages((prevState) => {
      // ...prevState は現在のメッセージ配列の全要素を新しい配列にコピーします。
      // その後、message（新しいメッセージ）を配列の末尾に追加します。
      return [...prevState, message];
    });
    // useCallback の第二引数 [] は空の依存配列です。
    // これは、この関数がコンポーネントの生涯を通じて一度だけ作成され、以降は同じ関数インスタンスが再利用されることを意味します。
  }, []);

  useEffect(() => {
    // このように、subscribe() でどの「部屋」にいるかを決め、bind() でその部屋の中で何が起きたときにどう反応するかを細かく設定する、
    // という構造になっています。これにより、一つの「部屋」（チャンネル）の中で、複数の異なるイベントに対して別々の反応を設定できるのです。

    // Pusherでは、「チャンネル」という概念を使用してメッセージをグループ化します。
    // subscribeメソッドは、指定されたチャンネルの「購読」を開始します。
    // 購読とは、そのチャンネルで発生するイベント（この場合は新しいメッセージ）をリッスンする準備をすることです。
    //　chatIdは特定のチャットルームを識別するユニークな文字列です。
    // これをチャンネル名として使用することで、各チャットルームごとに別々のチャンネルを作成できます。
    // 簡単に言えば、この行は「このチャットルームで起こることを教えてください」とPusherに伝えているようなものです。
    const channel = pusherClient.subscribe(chatId);

    // bind メソッドは、特定のイベントが発生したときに実行される関数を設定します。
    // 'message:new' は、新しいメッセージが送信されたときに発生するイベントの名前です。
    // handleNewMessage は、'message:new' イベントが発生したときに呼び出される関数です。
    // 新しいメッセージがこのチャンネルに送信されるたびに、handleNewMessage 関数が自動的に呼び出されます。
    // これにより、リアルタイムでメッセージを受信し、UIを即座に更新することができます。
    // 簡単に言えば、この行は「新しいメッセージが来たら、handleNewMessageという関数で処理してください」とPusherに指示しているようなものです。
    channel.bind('message:new', handleNewMessage);

    // このコードはコンポーネントがアンマウント（UI から削除）されるとき、または 効果が再実行される前に実行されます。
    // リソースの解放や購読の解除を行い、メモリリークを防ぎます。
    return () => {
      // この Pusher チャンネルの購読を解除します。
      // これにより、コンポーネントが存在しなくなった後にメッセージを受信しなくなります。
      channel.unsubscribe();
      // この行は、以前に設定した特定のイベントリスナーを Pusher チャンネルから削除します。
      // 具体的には、'message:new' イベントが発生したときに handleNewMessage 関数が呼び出されないようにします。
      // 第一引数 'message:new'：リスナーを解除するイベントの名前です。
      // 第二引数 handleNewMessage：削除するリスナー関数です。

      // メモリリークを防ぎます。不要になったリスナーを削除することで、メモリを効率的に使用できます。
      // コンポーネントがアンマウントされた後にイベントに反応することを防ぎます。
      channel.unbind('message:new', handleNewMessage);
    };
  }, [chatId, handleNewMessage]);

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
