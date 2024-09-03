import { PagingResult } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type PaginationState = {
  // 現在のページネーション状態を表すオブジェクトです。
  // totalPages, totalCount, pageNumber, pageSizeというpropertiesを持ちます。
  pagination: PagingResult;
  // この関数は全アイテム数（count）を受け取り、ページネーション状態を更新します。
  // 主に初期データ取得時や、データセットが変更されたときに使用されます。
  setPagination: (count: number) => void;
  // この関数は新しいページ番号（page）を受け取り、現在のページを更新します。
  // ユーザーが異なるページに移動するときに使用されます。
  setPage: (page: number) => void;
  // この関数は新しいページサイズ（pageSize）を受け取り、1ページあたりのアイテム数を更新します。
  // ユーザーがページサイズを変更するときに使用されます（例：10件表示から20件表示に変更）。
  setPageSize: (pageSize: number) => void;
};

// 128 (Adding a pagination store)
const usePaginationStore = create<PaginationState>()(
  devtools(
    (set) => ({
      // ストアの初期状態を定義しています。
      pagination: {
        // 現在表示しているページの番号です。通常、1から始まります。
        pageNumber: 1,

        // 1ページに表示するアイテムの数です。
        pageSize: 12,

        // データセット全体のアイテム総数です。
        totalCount: 0,

        // データセット全体のページ数です。
        totalPages: 1,
      },

      // 新しいページ番号を受け取ります。
      setPage: (page: number) =>
        set((state) => ({
          pagination: {
            // スプレッド演算子（...）を使用して現在のpagination状態をコピーして、
            ...state.pagination,

            // pageNumberだけを更新します。
            pageNumber: page,
          },
        })),

      // 新しいページサイズを受け取ります。pagination 状態を更新します。
      setPageSize: (pageSize: number) =>
        set((state) => ({
          pagination: {
            // スプレッド演算子（...）を使用して現在のpagination状態をコピーします。
            ...state.pagination,

            // pageNumber を1にリセットします。（ページサイズが変更されたため）
            pageNumber: 1,

            // 新しい pageSize をセットします。
            pageSize: pageSize,

            // totalPages を再計算します。（現在のtotalCountと新しいpageSizeを使用）
            totalPages: Math.ceil(state.pagination.totalCount / pageSize),
          },
        })),

      // この関数は新しい総アイテム数（totalCount）を受け取ります。
      setPagination: (totalCount: number) =>
        set((state) => ({
          pagination: {
            //　現在のページ番号を1にリセット
            pageNumber: 1,

            // pageSize は現在の値を維持します。
            pageSize: state.pagination.pageSize,

            // 新しい totalCount をセットします。
            totalCount,

            // totalPages を再計算します。（totalCount をページサイズで割って切り上げ）
            totalPages: Math.ceil(totalCount / state.pagination.pageSize),
          },
        })),
    }),
    { name: 'paginationStoreDemo' },
  ),
);

export default usePaginationStore;
