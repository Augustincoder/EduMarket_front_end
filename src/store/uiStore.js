// src/store/uiStore.js
import { create } from 'zustand';

const DEFAULT_FILTERS = {
  category:  '',
  query:     '',
  minPrice:  0,
  maxPrice:  200000,
  sort:      'newest',
  status:    'OPEN',
};

export const useUiStore = create((set) => ({
  activeSheet:    null,   // 'bid' | 'filter' | 'rating' | 'editProfile' | 'fileMenu'
  filterState:    { ...DEFAULT_FILTERS },
  searchExpanded: false,

  openSheet:  (name) => set({ activeSheet: name }),
  closeSheet: ()     => set({ activeSheet: null }),

  toggleSearch: () => set((s) => ({ searchExpanded: !s.searchExpanded })),
  closeSearch:  () => set({ searchExpanded: false }),

  setFilter: (key, value) =>
    set((s) => ({ filterState: { ...s.filterState, [key]: value } })),

  resetFilters: () => set({ filterState: { ...DEFAULT_FILTERS } }),
}));
