// src/hooks/useFavorites.js
import { useState } from 'react';
import toast from 'react-hot-toast';
import { hapticSuccess, hapticLight } from '../lib/telegram';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('edu_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const toggleFavorite = (user) => {
    hapticLight();
    const isFav = favorites.some((f) => f.id === user.id);
    let newFavs;
    if (isFav) {
      newFavs = favorites.filter((f) => f.id !== user.id);
      toast.success("Sevimlilardan o'chirildi");
    } else {
      newFavs = [...favorites, { id: user.id, fullname: user.fullname, avatarUrl: user.avatarUrl, badge: user.badge }];
      toast.success("Sevimlilarga qo'shildi! ❤️");
      hapticSuccess();
    }
    setFavorites(newFavs);
    localStorage.setItem('edu_favorites', JSON.stringify(newFavs));
  };

  const isFavorite = (userId) => favorites.some((f) => f.id === userId);

  return { favorites, toggleFavorite, isFavorite };
}
