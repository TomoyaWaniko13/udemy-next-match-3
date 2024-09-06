import { MessageDto } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 109 (Creating a message store)
// 113 (Getting the unread message count)
// 132 (Cursor based pagination Part 2)

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
      // stateは、関数が呼び出された時点でのMessageStateの現在の値を表します。
      // つまり、この時点でのmessages配列の内容を含んでいます。
      add: (message) => set((state) => ({ messages: [message, ...state.messages] })),

      // 指定されたIDのメッセージを配列から削除します。
      remove: (id) => set((state) => ({ messages: state.messages.filter((message) => message.id !== id) })),

      set: (messages) =>
        set((state) => {
          //  IDとメッセージ自体のペアを使用して新しいMapオブジェクトを作成します。
          //  Mapはキー（この場合はメッセージID）の一意性を保証するため、同じIDのメッセージがあった場合、後のものが前のものを上書きします。
          // hot module reloading や react strict mode により2回追加されることに対する対策です。
          const map = new Map(
            // 既存のメッセージと新しいメッセージを1つの配列に結合します。
            [...state.messages, ...messages]
              // 各メッセージをそのIDとメッセージ自体のペアに変換します。
              .map((message) => [message.id, message]),
          );

          // uniqueMessages は、Map 内のすべての値（メッセージ）を含む新しい配列になります。
          // この配列内のメッセージは一意です。なぜなら、元の Map では各メッセージ ID に対して1つのメッセージのみが格納されているからです。
          const uniqueMessages =
            // イテラブルオブジェクト（この場合は map.values() が返す Iterator）から新しい配列を作成します。
            // これにより、Map の値（メッセージオブジェクト）がすべて配列に変換されます。
            Array.from(
              //  Mapの値（メッセージオブジェクト）のみを取得します。
              // values() メソッドは、Map 内のすべての値を含む新しい Iterator オブジェクトを返します。
              map.values(),
            );

          // 重複が除去された新しいメッセージ配列で状態を更新します。
          return { messages: uniqueMessages };

          //   // サンプルのメッセージデータ
          // const messages = [
          //   { id: 1, text: "Hello" },
          //   { id: 2, text: "World" },
          //   { id: 1, text: "Hello (updated)" },  // 注意: id 1 が重複しています
          //   { id: 3, text: "!" }
          // ];
          //
          // // Map オブジェクトを作成
          // const map = new Map(messages.map(m => [m.id, m]));
          // console.log("Map object:");
          // console.log(map);
          //
          // // Map の values() メソッドを使用
          // const mapValues = map.values();
          // console.log("\nmap.values() の結果:");
          // console.log(mapValues);
          //
          // // Array.from() を使用して配列に変換
          // const uniqueMessages = Array.from(map.values());
          // console.log("\n最終的な uniqueMessages 配列:");
          // console.log(uniqueMessages);
          //
          // // 結果:
          // // Map object:
          // // Map(3) {
          // //   1 => { id: 1, text: 'Hello (updated)' },
          // //   2 => { id: 2, text: 'World' },
          // //   3 => { id: 3, text: '!' }
          // // }
          //
          // // map.values() の結果:
          // // [Map Iterator] { { id: 1, text: 'Hello (updated)' }, { id: 2, text: 'World' }, { id: 3, text: '!' } }
          //
          // // 最終的な uniqueMessages 配列:
          // // [
          // //   { id: 1, text: 'Hello (updated)' },
          // //   { id: 2, text: 'World' },
          // //   { id: 3, text: '!' }
          // // ]
        }),

      // 受信した未読のメッセージの件数にamountを足します。
      updateUnreadCount: (amount: number) => set((state) => ({ unreadCount: state.unreadCount + amount })),
      resetMessages: () => set({ messages: [] }),
    }),

    // ストアに名前を付けています。これは開発ツールでの識別に役立ちます。
    { name: 'messageStoreDemo' },
  ),
);

export default useMessageStore;
