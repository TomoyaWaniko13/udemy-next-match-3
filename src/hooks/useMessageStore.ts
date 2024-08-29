import { MessageDto } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 109 (Creating a message store)
type MessageState = {
  // MessageDto の配列で、全メッセージを保存します。
  messages: MessageDto[];
  //　新しいメッセージを追加する関数です。
  add: (message: MessageDto) => void;
  // 特定のIDのメッセージを削除する関数です。
  remove: (message: string) => void;
  // メッセージの配列全体を設定する関数です。
  set: (messages: MessageDto[]) => void;
};

// create<MessageState>() で新しいストアを作成します。
// useMessageStore は Zustand を使用して作成されたカスタムフックです。これにより、アプリケーション全体で一貫したメッセージの状態を管理できます。
const useMessageStore = create<MessageState>()(
  // ミドルウェアを使用して、開発ツールでのデバッグを可能にしています。
  devtools(
    (set) => ({
      // 初期状態は空の配列です。
      messages: [],
      // 新しいメッセージを配列の先頭に追加します。
      // stateは、関数が呼び出された時点でのMessageStateの現在の値を表します。つまり、この時点でのmessages配列の内容を含んでいます。
      add: (message) => set((state) => ({ messages: [message, ...state.messages] })),
      // 指定されたIDのメッセージを配列から削除します。
      remove: (id) => set((state) => ({ messages: state.messages.filter((message) => message.id !== id) })),
      // メッセージの配列全体を新しい値で置き換えます。
      set: (messages) => set({ messages }),
    }),
    // ストアに名前を付けています。これは開発ツールでの識別に役立ちます。
    { name: 'messageStoreDemo' },
  ),
);

export default useMessageStore;
