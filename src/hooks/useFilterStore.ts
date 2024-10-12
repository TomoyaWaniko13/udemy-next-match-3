import { UserFilters } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type FilterState = {
  filters: UserFilters;
  setFilters: (filterName: keyof FilterState['filters'], filterValue: any) => void;
};

const useFilterStore = create<FilterState>()(
  devtools((set) => ({
    filters: { ageRange: [18, 100], gender: ['male', 'female'], orderBy: 'updated', withPhoto: true },

    setFilters: (filterName, filterValue) => set((state) => ({ filters: { ...state.filters, [filterName]: filterValue } })),
  })),
);

export default useFilterStore;
