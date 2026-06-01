// src/hooks/useInfiniteScroll.js
import { useEffect, useRef } from 'react';

export function useInfiniteScroll(callback, { enabled = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) callback();
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [callback, enabled]);

  return ref;
}
