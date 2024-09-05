import { MessageDto } from '@/types';
import { Key, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteMessage, getMessagesByContainer } from '@/app/actions/messageActions';
import useMessageStore from '@/hooks/useMessageStore';

// 110 (Refactoring the message table)
// 111 (Adding the realtime functionality to the message table)
// 114 (Updating the count based on the event)
// 132 (Cursor based pagination Part 2)

// MessageTable.tsx で使用される logic などを useMessages() hook 内に記述しています。
const useMessages = (initialMessages: MessageDto[], nextCursor?: string) => {
  // cursorRef は useRef を使用して初期化され、その初期値は useMessages フックに渡される nextCursor パラメータです。
  const cursorRef = useRef(nextCursor);

  // (state) => { ... } はアロー関数の定義です。
  const { set, remove, messages, updateUnreadCount, resetMessages } = useMessageStore((state) => {
    // 新しいオブジェクトを作成しています。
    return {
      set: state.set,
      remove: state.remove,
      messages: state.messages,
      updateUnreadCount: state.updateUnreadCount,
      resetMessages: state.resetMessages,
    };
  });

  // Next.js の useSearchParams フックを使用しています。
  // 現在のURLのクエリパラメータ（URLの?以降の部分）を取得します。
  // URLが/messages?container=inboxの場合、searchParams.get('container')で'inbox'を取得できます。
  // parameterは<MessageSidebar/>で設定されるので、それを取得します。
  const searchParams = useSearchParams();

  const router = useRouter();

  // outboxかinboxが選択されているかを取得します。
  const isOutbox = searchParams.get('container') === 'outbox';
  const container = searchParams.get('container');

  // 1つ以上delete buttonがあるので、特定するためにidが必要です。
  const [isDeleting, setDeleting] = useState({ id: '', loading: false });

  // データ取得中であることをUIに示すために使用されます。
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // この useMessages() custom hook を使う component がロードされた時に、
    // set(initialMessages) が実行されます。
    set(initialMessages);
    cursorRef.current = nextCursor;

    return () => {
      resetMessages();
    };
  }, [initialMessages, resetMessages, set, nextCursor]);

  // この関数全体の目的は以下の通りです：
  // ユーザーが「もっと読み込む」ボタンをクリックしたときに呼び出されます。
  // 現在のカーソル位置から次のメッセージのセットを取得します。
  // 取得したメッセージをアプリケーションの状態（Zustand ストア）に追加します。
  // 次回の取得のために新しいカーソル位置を保存します。
  const loadMore = useCallback(async () => {
    //
    if (cursorRef.current) {
      // これは、データ取得中であることをUIに示すために使用されます。
      setLoadingMore(true);
      // getMessagesByContainer は非同期関数で、指定されたコンテナ（inbox や outbox）と
      // 現在のカーソル位置から次のメッセージのセットを取得します。
      const { messages, nextCursor } = await getMessagesByContainer(container, cursorRef.current);
      // これは Zustand ストアの set 関数を呼び出して、新しく取得したメッセージをストアに追加します。
      set(messages);
      // 次回 loadMore が呼ばれたときのために、新しいカーソル位置を保存します。
      cursorRef.current = nextCursor;
      // データ取得が完了したことをUIに示します。
      setLoadingMore(false);
    }
    //  useCallback は、この関数を記憶（メモ化）します。container や set が変更されない限り、同じ関数インスタンスを返します。
    //  これにより、不要な再レンダリングを防ぎます。
  }, [container, set]);

  const columns = [
    // 1つ目のcolumnのheader. outboxかinboxが選択されているかによって、keyとlabelを変更します。
    { key: isOutbox ? 'recipientName' : 'senderName', label: isOutbox ? 'Recipient' : 'Sender' },
    // 2つ目のcolumnのheaderです。
    { key: 'text', label: 'Message' },
    // 3つ目のcolumnのheader.outboxかinboxが選択されているかによってlabelを変更します。
    { key: 'created', label: isOutbox ? 'Date sent' : 'Date received' },
    // 4つ目のcolumnのheaderです。
    { key: 'actions', label: 'Actions' },
  ];

  const handleDeleteMessage = useCallback(
    //　deleteしたいMessageDto型のmessage を受け取ります。
    async (message: MessageDto) => {
      // id: message.idでどの deleteButtonをロード中と表示するか指定します。
      setDeleting({ id: message.id, loading: true });
      // deleteMessage() server actionで messageをdeleteします。
      // isOutboxは、送信者と受信者のどちらの視点から削除するかを決定しています。
      await deleteMessage(message.id, isOutbox);

      // useMessageStore()のremove() methodです。指定されたIDのメッセージを配列から削除します。
      remove(message.id);
      // useMessageStore()のupdateUnreadCount() methodです。
      // "inbox(受信箱)"の"未読"のメッセージを消去した場合、未読件数を-1します。
      if (!isOutbox && !message.dateRead) updateUnreadCount(-1);

      // deleteButtonをロード中と表示するのを終了します。
      setDeleting({ id: '', loading: false });
    },
    [isOutbox, remove, updateUnreadCount],
  );

  // keyはmessageのidを受け取ります。
  const handleRowSelect = (key: Key) => {
    // 配列の各要素 m に対して実行される条件関数です。この関数は、要素の id が引数 key と等しいかどうかをチェックします。
    // 条件に一致する要素が見つかった場合、その要素（つまり、特定のメッセージオブジェクト）が message 変数に代入されます。
    const message = initialMessages.find((m) => m.id === key);
    // outbox(送信箱) が選択されていたら、recipient との chat に移動します。
    // inbox(受信箱) が選択されていたら、sender との chat に移動します。
    const url = isOutbox ? `/members/${message?.recipientId}` : `/members/${message?.senderId}`;
    router.push(url + '/chat');
  };

  return {
    isOutbox,
    columns,
    deleteMessage: handleDeleteMessage,
    selectRow: handleRowSelect,
    isDeleting,
    messages,
    loadMore,
    loadingMore,
    hasMore: !!cursorRef.current,
  };
};

export default useMessages;
