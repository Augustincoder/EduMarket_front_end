// src/screens/freelancer/TaskFeedScreen.jsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskFeed } from '../../hooks/useTasks';
import { useUiStore } from '../../store/uiStore';
import { useDebounce } from '../../hooks/useDebounce';
import { hapticLight } from '../../lib/telegram';

import { TaskSearchHeader } from './TaskFeedScreen/components/TaskSearchHeader';
import { TaskFilterSheet } from './TaskFeedScreen/components/TaskFilterSheet';
import { TaskFeedList } from './TaskFeedScreen/components/TaskFeedList';

export default function TaskFeedScreen() {
  const [isFocused, setIsFocused] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const filterState = useUiStore((s) => s.filterState);
  const setFilter = useUiStore((s) => s.setFilter);
  const resetFilters = useUiStore((s) => s.resetFilters);

  const [localQuery, setLocalQuery] = useState('');
  const debouncedQuery = useDebounce(localQuery, 400);

  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches')) || []; }
    catch { return []; }
  });

  const addSearch = useCallback((query) => {
    if (!query) return;
    setRecentSearches(prev => {
      const newSearches = [query, ...prev.filter(q => q !== query)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      return newSearches;
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (debouncedQuery) addSearch(debouncedQuery);
  }, [debouncedQuery, addSearch]);

  const filters = {
    category:  filterState.category  || undefined,
    query:     debouncedQuery         || undefined,
    minPrice:  filterState.minPrice   || undefined,
    maxPrice:  filterState.maxPrice < 200000 ? filterState.maxPrice : undefined,
    status:    'OPEN',
    sort:      filterState.sort,
  };

  const {
    data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error, refetch
  } = useTaskFeed(filters);

  const allTasks = data?.pages ? data.pages.reduce((acc, p) => acc.concat(p.tasks || []), []) : [];

  const parentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      
      setScrollY(scrollTop);

      if (scrollTop > 250) setShowBackToTop(true);
      else setShowBackToTop(false);

      if (scrollHeight - scrollTop <= clientHeight + 200 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    const el = parentRef.current;
    el?.addEventListener('scroll', handleScroll, { passive: true });
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const scrollToTop = () => {
    hapticLight();
    parentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageLayout className="flex flex-col min-h-0 relative bg-edu-bg" scrollable={false}>
      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto scrollbar-hide relative"
      >
        <TaskSearchHeader
          localQuery={localQuery}
          setLocalQuery={setLocalQuery}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          filterState={filterState}
          setFilter={setFilter}
          setFilterOpen={setFilterOpen}
          scrollY={scrollY}
        />

        <TaskFeedList
          isFocused={isFocused}
          localQuery={localQuery}
          recentSearches={recentSearches}
          setLocalQuery={setLocalQuery}
          setIsFocused={setIsFocused}
          setFilter={setFilter}
          isLoading={isLoading}
          error={error}
          allTasks={allTasks}
          refetch={refetch}
          filters={filters}
          filterState={filterState}
          resetFilters={resetFilters}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.85 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={scrollToTop}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)_+_76px)] right-4 w-11 h-11 rounded-full bg-edu-surface/85 backdrop-blur-md border border-edu-border shadow-lg flex items-center justify-center text-edu-text active:scale-95 transition-transform z-40"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <TaskFilterSheet
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        filterState={filterState}
        setFilter={setFilter}
        resetFilters={resetFilters}
      />
    </PageLayout>
  );
}
