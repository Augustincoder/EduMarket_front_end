import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/client';

export const useCategoryStore = create(
  persist(
    (set, get) => ({
      categories: [],
      lastFetched: null,
      isLoading: false,
      error: null,

      fetchCategories: async (force = false) => {
        const { lastFetched, categories } = get();
        // Return from cache if we have categories and they are fresh (< 1 hour)
        if (!force && categories.length > 0 && lastFetched && (Date.now() - lastFetched < 1000 * 60 * 60)) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const res = await api.get('/categories');
          const data = res.data.data.categories;
          set({ 
            categories: data, 
            lastFetched: Date.now(),
            isLoading: false 
          });
        } catch (err) {
          console.error("Failed to fetch categories:", err);
          set({ error: err.message, isLoading: false });
        }
      },

      // Helper selectors
      getCategoryByValue: (value) => get().categories.find(c => c.value === value),
      getTrendingCategories: () => get().categories.filter(c => c.isTrending).slice(0, 5)
    }),
    {
      name: 'category-storage',
      partialize: (state) => ({ categories: state.categories, lastFetched: state.lastFetched }),
    }
  )
);
