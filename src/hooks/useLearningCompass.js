import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../services/other.service';

export function useLearningCompass() {
  return useQuery({
    queryKey: ['learning-compass'],
    queryFn: () => aiApi.getLearningCompass().then(res => res.data.data),
    staleTime: 60 * 60 * 1000, // 1 hour (macro data doesn't change rapidly)
  });
}
