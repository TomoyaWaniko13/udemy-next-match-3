'use client';

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import { MessageDto } from '@/types';
import { Card } from '@nextui-org/card';
import MessageTableCell from '@/app/messages/MessageTableCell';
import useMessages from '@/hooks/useMessages';

type Props = {
  initialMessages: MessageDto[];
};

// 90 (Creating the message table)
// 91 (Adding the message read functionality)
// 92 (Using custom cells in the NextUI table)
// 94 (Finishing up the message table)
// 107 (Displaying presence in other components)
// 110 (Refactoring the message table)
// 111 (Adding the realtime functionality to the message table)
const MessageTable = ({ initialMessages }: Props) => {
  // Zustand ストアの状態が変更されると、その状態を使用しているコンポーネント（この場合は MessageTable）が
  // 自動的に再レンダリングされ、新しいメッセージが表示されます
  // useMessages() custom hooksは、<MessageTable/>で必要なlogicをまとめています。
  const { columns, isOutbox, isDeleting, deleteMessage, selectRow, messages } = useMessages(initialMessages);

  // NextUIのTableの書き方について:
  // https://nextui.org/docs/components/table
  return (
    <Card className={'flex flex-col gap-3 h-[80vh] overflow-auto'}>
      <Table
        aria-label={'Table with messages'}
        selectionMode={'single'}
        onRowAction={(key) => selectRow(key)}
        shadow={'none'}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} width={column.key === 'text' ? '50%' : undefined}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        {/* TableBody は items prop として messages 配列を受け取り、
        　　その各要素（item）に対して関数を適用してテーブルの行を生成します。 */}
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
                  <MessageTableCell
                    item={item}
                    columnKey={columnKey as string}
                    isOutbox={isOutbox}
                    deleteMessage={deleteMessage}
                    isDeleting={isDeleting.loading && isDeleting.id === item.id}
                  />
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
