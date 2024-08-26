import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 103 (Adding a presence store)
type PresenceState = {
  // メンバーのIDを文字列として保存する配列を定義しています。
  members: string[];
  // 新しいメンバーを追加するための関数の型定義です。
  add: (id: string) => void;
  // メンバーを削除するための関数の型定義です。
  remove: (id: string) => void;
  // メンバーリスト全体を設定するための関数の型定義です。
  set: (ids: string[]) => void;
};

const usePresenceStore = create<PresenceState>()(
  // devtools()はデバッグ用のミドルウェアです。
  devtools(
    // これは、ストアの初期状態と更新関数を定義しています。
    // set(は状態を更新するための関数で、Zustandによって提供されます。
    (set) => ({
      // メンバーリストの初期状態を空の配列に設定しています。
      members: [],
      // これは現在の状態(state)を取得し、新しいidを追加した新しい配列を作成しています。
      add: (id) => set((state) => ({ members: [...state.members, id] })),
      // これはfilterを使用して、指定されたid以外のメンバーだけを含む新しい配列を作成しています。
      remove: (id) => set((state) => ({ members: state.members.filter((member) => member !== id) })),
      // メンバーリスト全体を設定する関数です。 これは単純にmembersを新しい配列で置き換えます。
      set: (ids) => set({ members: ids }),
    }),
    // これはdevtoolsミドルウェアの設定で、DevToolsでこのストアを識別するための名前を設定しています。
    { name: 'PresenceStore' },
  ),
);

export default usePresenceStore;
