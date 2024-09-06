import { PagingResult } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type PaginationState = {
  // 現在のページネーション状態を表すオブジェクトです。
  // totalPages, totalCount, pageSize, pageNumber という properties を持ちます。
  pagination: PagingResult;

  // この関数は全アイテム数（count）を受け取り、ページネーション状態を更新します。
  setTotalCount: (count: number) => void;

  // この関数は新しいページ番号（page）を受け取り、現在のページを更新します。
  setPageNumber: (page: number) => void;

  // この関数は新しいページサイズ（pageSize）を受け取り、1ページあたりのアイテム数を更新します。
  setPageSize: (pageSize: number) => void;
};

// 128 (Adding a pagination store)
const usePaginationStore = create<PaginationState>()(
  devtools(
    (set) => ({
      // ストアの初期状態を定義しています。
      pagination: {
        // 1ページに表示するアイテムの数です。
        pageSize: 12,

        // pageNumber を1にリセットします。
        pageNumber: 1,

        // データセット全体のアイテム総数です。
        totalCount: 0,

        // データセット全体のページ数です。
        totalPages: 1,
      },

      // 新しいページサイズを受け取ります。pagination 状態を更新します。
      setPageSize: (pageSize: number) =>
        set((state) => ({
          pagination: {
            // totalCount は変わらないので、スプレッド演算子（...）を使用して現在の pagination 状態をコピーします。
            ...state.pagination,

            // 新しい pageSize をセットします。
            pageSize: pageSize,

            // pageNumber を1にリセットします。（ページサイズが変更されたため）
            pageNumber: 1,

            // totalPages を再計算します。（現在のtotalCountと新しいpageSizeを使用）
            totalPages: Math.ceil(state.pagination.totalCount / pageSize),
          },
        })),

      // 新しいページ番号を受け取ります。
      setPageNumber: (page: number) =>
        set((state) => ({
          pagination: {
            // totalPages, totalCount, pageSize は変わらないので、
            // スプレッド演算子（...）を使用して現在の pagination 状態をコピーして、
            ...state.pagination,

            // pageNumber だけを更新します。
            pageNumber: page,
          },
        })),

      // この関数は新しい総アイテム数（totalCount）を受け取ります。
      setTotalCount: (totalCount: number) =>
        set((state) => ({
          pagination: {
            // pageSize は 現在の値を維持します。
            pageSize: state.pagination.pageSize,

            // pageNumber を1にリセットします。
            pageNumber: 1,

            // 新しい totalCount をセットします。
            totalCount,

            // totalPages を再計算します。（新しい totalCount を 現在の pageSize で割って切り上げ）
            totalPages: Math.ceil(totalCount / state.pagination.pageSize),
          },
        })),
    }),
    { name: 'paginationStoreDemo' },
  ),
);

export default usePaginationStore;
