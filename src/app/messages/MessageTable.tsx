'use client';
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue } from '@nextui-org/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageDto } from '@/types';
import { Key } from 'react';
import { Card } from '@nextui-org/card';

type Props = {
  messages: MessageDto[];
};

// 90 (Creating the message table)
const MessageTable = ({ messages }: Props) => {
  // parameterは<MessageSidebar />で設定されるので、それを取得する。
  const searchParams = useSearchParams();
  const router = useRouter();
  // outboxかinboxが選択されているかを取得する。
  const isOutbox = searchParams.get('container') === 'outbox';

  const columns = [
    // 1つ目のcolumnのheader. outboxかinboxが選択されているかによって、keyとlabelを変更する。
    { key: isOutbox ? 'recipientName' : 'senderName', label: isOutbox ? 'Recipient' : 'Sender' },
    // 2つ目のcolumnのheader.
    { key: 'text', label: 'Message' },
    // 3つ目のcolumnのheader.　outboxかinboxが選択されているかによって、labelを変更する。
    { key: 'created', label: isOutbox ? 'Date sent' : 'Date received' },
  ];

  const handleRowSelect = (key: Key) => {
    const message = messages.find((m) => m.id === key);
    // outboxが選択されていたら、recipientとのchatに移動する。
    // inboxが選択されていたら、senderとのchatに移動する。
    const url = isOutbox ? `/members/${message?.recipientId}` : `/members/${message?.senderId}`;
    router.push(url + '/chat');
  };

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
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        {/* TableBody は items prop として messages 配列を受け取り、その各要素（item）に対して関数を適用してテーブルの行を生成します。 */}
        <TableBody items={messages} emptyContent={'No messages for this container'}>
          {/* item は messages 配列の各要素を表します. */}
          {(item) => (
            <TableRow key={item.id} className={'cursor-pointer'}>
              {/*　1列目では columnKey は 'recipientName' または 'senderName', 2列目では columnKey は 'text', 3列目では columnKey は 'created'　*/}
              {/*
            getKeyValue()について:
            const message = {
                   id: 1,
                   senderName: "Alice",
                   text: "Hello!",
                   created: "2024-08-21"
                };
              の場合、
              1列目（columnKey が 'senderName' の場合）: getKeyValue(message, 'senderName') は "Alice" を返します。
              2列目（columnKey が 'text' の場合）: getKeyValue(message, 'text') は "Hello!" を返します。
              3列目（columnKey が 'created' の場合）: getKeyValue(message, 'created') は "2024-08-21" を返します。
              */}
              {(columnKey) => (
                <TableCell>
                  <div className={`${!item.dateRead && !isOutbox}` ? 'font-semibold' : ''}>
                    {getKeyValue(item, columnKey)}
                  </div>
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
