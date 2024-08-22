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
import { Key, useCallback } from 'react';
import { Card } from '@nextui-org/card';
import { AiFillDelete } from 'react-icons/ai';

type Props = {
  messages: MessageDto[];
};

// 90 (Creating the message table)
// 91 (Adding the message read functionality)
// 92 (Using custom cells in the NextUI table)
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
    { key: 'actions', label: 'Actions' },
  ];

  const handleRowSelect = (key: Key) => {
    const message = messages.find((m) => m.id === key);
    // outboxが選択されていたら、recipientとのchatに移動する。
    // inboxが選択されていたら、senderとのchatに移動する。
    const url = isOutbox ? `/members/${message?.recipientId}` : `/members/${message?.senderId}`;
    router.push(url + '/chat');
  };

  // renderCell()関数は、テーブルの各セルの内容をカスタマイズするために使用されています。この関数は2つの引数を受け取ります：
  // item: 現在の行のデータ（MessageDto型）
  // columnKey: 現在のカラムのキー（keyof MessageDto型）
  const renderCell = useCallback(
    (item: MessageDto, columnKey: keyof MessageDto) => {
      const cellValue = item[columnKey];

      // returnの中が各々のcellとなる。
      switch (columnKey) {
        case 'recipientName':
        case 'senderName':
          return (
            <div className={`flex items-center gap-2 cursor-pointer `}>
              <Avatar
                alt={'Image of member'}
                src={(isOutbox ? item.recipientImage : item.senderImage) || '/images/user.png'}
              />
              <span>{cellValue}</span>
            </div>
          );
        case 'text':
          return <div className={'truncate'}>{cellValue}</div>;
        case 'created':
          return cellValue;
        default:
          return (
            <Button isIconOnly={true} variant={'light'}>
              <AiFillDelete size={24} className={'text-danger'} />
            </Button>
          );
      }
    },
    [isOutbox],
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
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
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
