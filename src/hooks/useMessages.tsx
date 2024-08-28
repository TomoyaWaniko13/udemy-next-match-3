import { MessageDto } from '@/types';
import { Key, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteMessage } from '@/app/actions/messageActions';

// 110 (Refactoring the message table
const UseMessages = (messages: MessageDto[]) => {
  // parameterは<MessageSidebar />で設定されるので、それを取得する。
  const searchParams = useSearchParams();
  const router = useRouter();
  // outboxかinboxが選択されているかを取得する。
  const isOutbox = searchParams.get('container') === 'outbox';
  // 1つ以上delete buttonがあるので、特定するためにidが必要。
  const [isDeleting, setDeleting] = useState({ id: '', loading: false });

  const columns = [
    // 1つ目のcolumnのheader. outboxかinboxが選択されているかによって、keyとlabelを変更する。
    { key: isOutbox ? 'recipientName' : 'senderName', label: isOutbox ? 'Recipient' : 'Sender' },
    // 2つ目のcolumnのheader.
    { key: 'text', label: 'Message' },
    // 3つ目のcolumnのheader.　outboxかinboxが選択されているかによって、labelを変更する。
    { key: 'created', label: isOutbox ? 'Date sent' : 'Date received' },
    { key: 'actions', label: 'Actions' },
  ];

  const handleDeleteMessage = useCallback(
    async (message: MessageDto) => {
      setDeleting({ id: message.id, loading: true });
      await deleteMessage(message.id, isOutbox);
      router.refresh();
      setDeleting({ id: '', loading: false });
    },
    // isOutboxが変更された場合（例：ユーザーが送信箱と受信箱を切り替えた場合）、handleDeleteMessage関数が再作成されます。
    // routerが変更された場合、新しいrouterインスタンスを使用して関数が再作成されます。
    [isOutbox, router],
  );

  const handleRowSelect = (key: Key) => {
    const message = messages.find((m) => m.id === key);
    // outboxが選択されていたら、recipientとのchatに移動する。
    // inboxが選択されていたら、senderとのchatに移動する。
    const url = isOutbox ? `/members/${message?.recipientId}` : `/members/${message?.senderId}`;
    router.push(url + '/chat');
  };

  const renderCell = useCallback(
    (item: MessageDto, columnKey: keyof MessageDto) => {},
    // isOutbox の値が変わると（ユーザーが送信箱と受信箱を切り替えた時）、
    // 正しい画像を表示するために関数を再作成する必要があります。
    // 削除中のメッセージID (isDeleting.id) や読み込み状態 (isDeleting.loading) が変わった時、
    // ボタンの表示を更新するために関数を再作成する必要があります。
    [isOutbox, isDeleting.id, isDeleting.loading, handleDeleteMessage],
  );
  return { isOutbox, columns, deleteMessage: handleDeleteMessage, selectRow: handleRowSelect, isDeleting };
};

export default UseMessages;
