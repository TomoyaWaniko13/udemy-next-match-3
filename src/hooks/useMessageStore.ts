import { MessageDto } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 109 (Creating a message store)
// 113 (Getting the unread message count)
type MessageState = {
  // MessageDto の配列で、全メッセージを保存します。
  messages: MessageDto[];
  // 受信した未読のメッセージの件数を表しています。
  unreadCount: number;
  //　新しいメッセージを追加する関数です。
  add: (message: MessageDto) => void;
  // 特定のIDのメッセージを削除する関数です。
  remove: (message: string) => void;
  // メッセージの配列全体を設定する関数です。
  set: (messages: MessageDto[]) => void;
  // 受信した未読のメッセージの件数を更新する関数です。
  updateUnreadCount: (amount: number) => void;
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
      // stateは、関数が呼び出された時点でのMessageStateの現在の値を表します。
      // つまり、この時点でのmessages配列の内容を含んでいます。
      add: (message) => set((state) => ({ messages: [message, ...state.messages] })),
      // 指定されたIDのメッセージを配列から削除します。
      remove: (id) => set((state) => ({ messages: state.messages.filter((message) => message.id !== id) })),
      // メッセージの配列全体を新しい値で置き換えます。
      set: (messages) => set({ messages }),
      // 受信した未読のメッセージの件数にamountを足します。
      updateUnreadCount: (amount: number) => set((state) => ({ unreadCount: state.unreadCount + amount })),
    }),
    // ストアに名前を付けています。これは開発ツールでの識別に役立ちます。
    { name: 'messageStoreDemo' },
  ),
);

export default useMessageStore;
