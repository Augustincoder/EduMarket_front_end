import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { milestonesApi } from '../services/tasks.service';

export function useMilestones(taskId) {
  return useQuery({
    queryKey: ['milestones', taskId],
    queryFn: () => milestonesApi.getAll(taskId).then(res => res.data.data),
    enabled: !!taskId
  });
}

export function useMilestoneMutations(taskId) {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data) => milestonesApi.create(taskId, data),
  });

  const toggle = useMutation({
    mutationFn: ({ milestoneId, isCompleted }) => 
      milestonesApi.toggle(taskId, milestoneId, { isCompleted }),
  });

  const remove = useMutation({
    mutationFn: (milestoneId) => milestonesApi.delete(taskId, milestoneId),
  });

  return { create, toggle, remove };
}
