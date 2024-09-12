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

  const searchParams = useSearchParams();
  const router = useRouter();

  // outbox か inbox が選択されているかを取得します。
  // outbox や inbox のどちらの UI を表示するかの判別や server action などにおいてこの真偽値が使われます。
  const container = searchParams.get('container');
  const isOutbox = container === 'outbox';

  // keyはMessageDtoのpropertyの名前と一致しないといけません。
  const columns = [
    { key: isOutbox ? 'recipientName' : 'senderName', label: isOutbox ? 'Recipient' : 'Sender' },
    { key: 'text', label: 'Message' },
    { key: 'created', label: isOutbox ? 'Date sent' : 'Date received' },
    { key: 'actions', label: 'Actions' },
  ];

  // 1つ以上 delete button があるので、特定するためにidが必要です。
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

  // ユーザーが「もっと読み込む」ボタンをクリックしたときに呼び出されます。
  const loadMore = useCallback(async () => {
    if (cursorRef.current) {
      // これは、データ取得中であることをUIに示すために使用されます。
      setLoadingMore(true);
      // この getMessagesByContainer() は2回目以降使われます。
      // 1回目は messages/page.tsx の getMessagesByContainer() が使われます。
      const { messages, nextCursor } = await getMessagesByContainer(container, cursorRef.current);
      set(messages);
      // 次回 loadMore が呼ばれたときのために、新しいカーソル位置を保存します。
      cursorRef.current = nextCursor;
      // データ取得が完了したことをUIに示します。
      setLoadingMore(false);
    }
    //  useCallback は、この関数を記憶（メモ化）します。container や set が変更されない限り、同じ関数インスタンスを返します。
    //  これにより、不要な再レンダリングを防ぎます。
  }, [container, set]);

  const handleDeleteMessage = useCallback(
    //　deleteしたいmessage を受け取ります。
    async (message: MessageDto) => {
      // id: message.id でどの deleteButton をロード中と表示するか指定します。
      setDeleting({ id: message.id, loading: true });

      await deleteMessage(message.id, isOutbox);

      remove(message.id);

      if (!message.dateRead && !isOutbox) {
        updateUnreadCount(-1);
      }

      setDeleting({ id: '', loading: false });
    },
    [isOutbox, remove, updateUnreadCount],
  );

  // この関数により、ユーザーがメッセージリストから特定のメッセージを選択したとき、
  // そのメッセージの送信者または受信者とのチャットページに直接移動できるようになります。
  // message の id を受け取ります。type Key = string | number;　です。
  const handleRowSelect = (messageId: Key) => {
    const message = initialMessages.find((message) => message.id === messageId);
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
