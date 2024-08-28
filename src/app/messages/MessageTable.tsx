'use client';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
  Avatar,
  Button,
} from '@nextui-org/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageDto } from '@/types';
import { Key, useCallback, useState } from 'react';
import { Card } from '@nextui-org/card';
import { AiFillDelete } from 'react-icons/ai';
import { deleteMessage } from '@/app/actions/messageActions';
import { truncateString } from '@/lib/util';
import PresenceAvatar from '@/components/PresenceAvatar';

type Props = {
  messages: MessageDto[];
};

// 90 (Creating the message table)
// 91 (Adding the message read functionality)
// 92 (Using custom cells in the NextUI table)
// 94 (Finishing up the message table)
// 107 (Displaying presence in other components)
const MessageTable = ({ messages }: Props) => {
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

  // 関数の再作成:
  // useCallback()を使用しない場合：
  // handleDeleteMessage関数はMessageTableコンポーネントが再レンダリングされるたびに新しく作成されます。
  // これは、状態が更新されたり、親コンポーネントが再レンダリングされたりするたびに発生します。
  //
  // useCallback()を使用する場合：
  // handleDeleteMessage関数は依存配列（この場合は[isOutbox, router]）の値が変更されない限り、同じ関数参照を保持します。
  // コンポーネントが再レンダリングされても、これらの依存値が変わらなければ、関数は再作成されません。

  // 子コンポーネントの再レンダリング：
  // useCallback()を使用しない場合：
  // handleDeleteMessageを props として受け取る子コンポーネント（例：削除ボタン）は、MessageTableが再レンダリングされるたびに再レンダリングされる可能性があります。
  //
  // useCallback()を使用する場合：
  // 子コンポーネントは、handleDeleteMessageの参照が変わらない限り、不必要な再レンダリングを回避できます。
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

  // renderCell()関数は、テーブルの各セルの内容をカスタマイズするために使用されています。
  // この関数は2つの引数を受け取ります：
  // item: 現在の行のデータ（MessageDto型）
  // columnKey: 現在のカラムのキー（keyof MessageDto型）

  // 関数の再作成：
  // useCallback() を使用しない場合：
  // renderCell() 関数は MessageTable コンポーネントが再レンダリングされるたびに新しく作成されます。
  // これは、状態が更新されたり、親コンポーネントが再レンダリングされたりするたびに発生します。

  // useCallback() を使用する場合：
  // renderCell() 関数は依存配列（[isOutbox, isDeleting.id, isDeleting.loading, handleDeleteMessage]）の値が変更されない限り、同じ関数参照を保持します。
  // コンポーネントが再レンダリングされても、これらの依存値が変わらなければ、関数は再作成されません。

  // パフォーマンスへの影響：
  // useCallback() を使用しない場合：
  // TableBody 内の各 TableCell コンポーネントは、MessageTable が再レンダリングされるたびに、新しい renderCell 関数を受け取ることになります。
  // これにより、すべての TableCell コンポーネントが不必要に再レンダリングされる可能性があります。
  //
  // useCallback() を使用する場合：
  // renderCell 関数の参照が変わらない限り、TableCell コンポーネントは不必要な再レンダリングを回避できます。
  // これは特に、大量のメッセージを表示する場合に重要です。
  const renderCell = useCallback(
    (item: MessageDto, columnKey: keyof MessageDto) => {
      const cellValue = item[columnKey];

      // returnの中が各々のcellとなる。
      switch (columnKey) {
        case 'recipientName':
        case 'senderName':
          return (
            <div className={`flex items-center gap-2 cursor-pointer `}>
              {/* 107 (Displaying presence in other components) */}
              <PresenceAvatar
                src={isOutbox ? item.recipientImage : item.senderImage}
                userId={isOutbox ? item.recipientId : item.senderId}
              />
              <span>{cellValue}</span>
            </div>
          );
        case 'text':
          return <div>{truncateString(cellValue)}</div>;
        case 'created':
          return cellValue;
        default:
          return (
            <Button
              isIconOnly={true}
              variant={'light'}
              onClick={() => handleDeleteMessage(item)}
              isLoading={isDeleting.id === item.id && isDeleting.loading}
            >
              <AiFillDelete size={24} className={'text-danger'} />
            </Button>
          );
      }
    },
    // isOutboxの値が変わると（ユーザーが送信箱と受信箱を切り替えた時）、正しい画像を表示するために関数を再作成する必要があります。
    // 削除中のメッセージID(isDeleting.id)や読み込み状態(isDeleting.loading)が変わった時、ボタンの表示を更新するために関数を再作成する必要があります。
    //
    [isOutbox, isDeleting.id, isDeleting.loading, handleDeleteMessage],
  );

  // NextUIのTableについて:
  // https://nextui.org/docs/components/table
  return (
    <Card className={'flex flex-col gap-3 h-[80vh] overflow-auto'}>
      <Table
        aria-label={'Table with messages'}
        selectionMode={'single'}
        onRowAction={(key) => handleRowSelect(key)}
        shadow={'none'}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} width={column.key === 'text' ? '50%' : undefined}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        {/* TableBody は items prop として messages 配列を受け取り、その各要素（item）に対して関数を適用してテーブルの行を生成します。 */}
        <TableBody items={messages} emptyContent={'No messages for this container'}>
          {/* item は messages 配列の各要素を表します.
              外側の関数：{(item) => (...)}　は messages 配列の各要素（各メッセージ）に対して呼び出されます。
          */}
          {(item) => (
            // 各メッセージに対して1つの行(row)を生成します。
            <TableRow key={item.id} className={'cursor-pointer'}>
              {/* 外側の関数：{(columnKey) => (...)} この関数は各列（columns 配列で定義された各要素）に対して呼び出されます。
                  columnKey は列(column)の識別子で、'recipientName'（または 'senderName'）、'text'、'created'、'actions' のいずれかです。*/}
              {(columnKey) => (
                <TableCell className={`${!item.dateRead && !isOutbox ? 'font-semibold' : ''}`}>
                  {renderCell(item, columnKey as keyof MessageDto)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default MessageTable;
