import { MessageDto } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 109 (Creating a message store)
// 113 (Getting the unread message count)
// 132 (Cursor based pagination Part 2)

type MessageState = {
  messages: MessageDto[];
  unreadCount: number;
  add: (message: MessageDto) => void;
  // 特定のIDのメッセージを削除する関数です。
  remove: (messageId: string) => void;
  set: (messages: MessageDto[]) => void;
  updateUnreadCount: (amount: number) => void;
  resetMessages: () => void;
};

// create<MessageState>() で新しいストアを作成します。
// useMessageStore は Zustand を使用して作成されたカスタムフックです。
// これにより、アプリケーション全体で一貫したメッセージの状態を管理できます。
const useMessageStore = create<MessageState>()(
  // ミドルウェアを使用して、開発ツールでのデバッグを可能にしています。
  devtools(
    (set) => ({
      // 初期状態は空の配列です。
      messages: [],
      // 初期状態は0です。
      unreadCount: 0,

      // 新しいメッセージを配列の"先頭"に追加します。"先頭"に追加することで、適切な順番でメッセージを表示できます。
      add: (message) => set((state: MessageState) => ({ messages: [message, ...state.messages] })),
      // 指定されたIDのメッセージを配列から削除します。
      remove: (messageId) => set((state: MessageState) => ({ messages: state.messages.filter((message) => message.id !== messageId) })),
      set: (messages: MessageDto[]) =>
        set((state: MessageState) => {
          const allMessages: MessageDto[] = [...state.messages, ...messages];
          const messagePairs: [string, MessageDto][] = allMessages.map((message: MessageDto) => [message.id, message]);
          const map: Map<string, MessageDto> = new Map(messagePairs);
          const uniqueMessages: MessageDto[] = Array.from(map.values() as IterableIterator<MessageDto>);
          // 重複が除去された新しいメッセージ配列で状態を更新します。
          return { messages: uniqueMessages };
        }),
      // 受信した未読のメッセージの件数に newUnreadAmount を足します。
      updateUnreadCount: (newUnreadAmount: number) => set((state: MessageState) => ({ unreadCount: state.unreadCount + newUnreadAmount })),
      resetMessages: () => set({ messages: [] }),
    }),

    // ストアに名前を付けています。これは開発ツールでの識別に役立ちます。
    { name: 'messageStoreDemo' },
  ),
);

export default useMessageStore;
