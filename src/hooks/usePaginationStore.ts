import { PagingResult } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type PaginationState = {
  pagination: PagingResult;
  setTotalCount: (count: number) => void;
  setPageNumber: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};

// 128 (Adding a pagination store)
const usePaginationStore = create<PaginationState>()(
  devtools(
    (set) => ({
      pagination: { pageSize: 12, pageNumber: 1, totalCount: 0, totalPages: 1 },

      setPageSize: (pageSize: number) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            pageSize: pageSize,
            pageNumber: 1,
            totalPages: Math.ceil(state.pagination.totalCount / pageSize),
          },
        })),

      setPageNumber: (page: number) =>
        set((state) => ({
          pagination: { ...state.pagination, pageNumber: page },
        })),

      setTotalCount: (totalCount: number) =>
        set((state) => ({
          pagination: {
            pageSize: state.pagination.pageSize,
            pageNumber: 1,
            totalCount,
            totalPages: Math.ceil(totalCount / state.pagination.pageSize),
          },
        })),
    }),
    { name: 'paginationStoreDemo' },
  ),
);

export default usePaginationStore;
