import { UserFilters } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type FilterState = {
  // { ageRange: '25,81', gender: ',male,female', orderBy: 'created' } などが filters の値の一例です。
  filters: UserFilters;
  // keyof により、1つ目の引数の filterName は filters オブジェクトのキー（'ageRange'、'gender'、'orderBy'）のいずれかでなければなりません。
  //　2つ目の引数の value について、フィルターの値はさまざまな型（数値の配列、文字列の配列、文字列）になり得るため、any が使用されています。
  // これらの引数を使って、状態を更新します。状態を更新する関数が値を返す必要はないので、戻り値の型は void です。
  // この関数の目的は、特定のフィルター（filterName で指定）の値（value で指定）を更新することです。
  setFilters: (filterName: keyof FilterState['filters'], value: any) => void;
};

const useFilterStore = create<FilterState>()(
  devtools((set) => ({
    //　filters の初期値です。
    filters: {
      ageRange: [18, 100],
      gender: ['male', 'female'],
      orderBy: 'updated',
      withPhoto: true,
    },
    // filterName: 更新するフィルターの名前
    // value: フィルターに設定する新しい値
    setFilters: (filterName, value) =>
      // Zustand の set 関数はストアの状態を更新するために使用されます。
      set((state) => {
        return {
          // filters: はストアのどの部分を更新するかを指定しています。
          // ...state.filters はスプレッド構文を使用して、現在の filters オブジェクトの全てのプロパティをコピーしています。
          // [filterName]: value は [] (Computed Property Names)を使用して、
          // 指定された filterName に対応するプロパティを新しい value で上書きまたは追加しています。
          filters: { ...state.filters, [filterName]: value },
        };
      }),
  })),
);

export default useFilterStore;
