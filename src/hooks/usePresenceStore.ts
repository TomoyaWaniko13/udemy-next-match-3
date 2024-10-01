import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 103 (Adding a presence store)

type PresenceState = {
  members: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  set: (ids: string[]) => void;
};

const usePresenceStore = create<PresenceState>()(
  // devtools() はデバッグ用のミドルウェアです。
  devtools(
    // これは、ストアの初期状態と更新関数を定義しています。
    (set) => ({
      // メンバーリストの初期状態を空の配列に設定しています。
      members: [],
      add: (id: string) => set((state: PresenceState) => ({ members: [...state.members, id] })),
      remove: (id: string) => set((state: PresenceState) => ({ members: state.members.filter((member) => member !== id) })),
      // メンバーリスト全体を設定する関数です。 これは members を新しい配列で置き換えます。
      set: (ids: string[]) => set({ members: ids }),
    }),
    // これは devtools ミドルウェアの設定で、DevToolsでこのストアを識別するための名前を設定しています。
    { name: 'PresenceStore' },
  ),
);

export default usePresenceStore;
