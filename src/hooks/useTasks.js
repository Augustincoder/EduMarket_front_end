// src/hooks/useTasks.js
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, bidsApi } from '../services/tasks.service';
import toast from 'react-hot-toast';

// ─── Task Feed (infinite) ───────────────────────────
export function useTaskFeed(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['tasks', filters],
    queryFn:  ({ pageParam }) =>
      tasksApi.getAll({ ...filters, cursor: pageParam, limit: 10 })
        .then((r) => r.data.data),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    staleTime: 30 * 1000,
  });
}

// ─── My Tasks ───────────────────────────────────────
export function useMyTasks(role, status) {
  return useQuery({
    queryKey: ['tasks', 'my', { role, status }],
    queryFn: () => tasksApi.getMyTasks({ role, status }).then(r => r.data.data),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });
}

// ─── Single Task ────────────────────────────────────
export function useTask(id) {
  return useQuery({
    queryKey: ['task', id],
    queryFn:  () => tasksApi.getOne(id).then((r) => r.data.data),
    enabled:  !!id,
    staleTime: 20 * 1000,
  });
}

// ─── Create Task ────────────────────────────────────
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => tasksApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Vazifa muvaffaqiyatli e'lon qilindi!");
    },
    onError: (err) => {
      if (err.serverErrors) {
        toast.error('Iltimos, xatoliklarni to\'g\'irlang');
      } else {
        toast.error(err.serverMsg || 'Vazifa yaratishda xato');
      }
    },
  });
}

// ─── Task State Transition ──────────────────────────
export function useTaskTransition(taskId) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['task', taskId] });
    qc.invalidateQueries({ queryKey: ['tasks'] });
  };

  const optimisticStatusUpdate = async (newStatus) => {
    await qc.cancelQueries({ queryKey: ['task', taskId] });
    const previousTask = qc.getQueryData(['task', taskId]);
    if (previousTask) {
      qc.setQueryData(['task', taskId], { ...previousTask, status: newStatus });
    }
    return { previousTask };
  };

  const onError = (err, variables, context) => {
    if (context?.previousTask) {
      qc.setQueryData(['task', taskId], context.previousTask);
    }
    toast.error(err.serverMsg || "Harakat amalga oshmadi.");
  };

  const startProgress   = useMutation({ 
    mutationFn: () => tasksApi.startProgress(taskId),
    onMutate: () => optimisticStatusUpdate('IN_PROGRESS'),
    onError,
    onSettled: invalidate 
  });
  
  const submitReview    = useMutation({ 
    mutationFn: () => tasksApi.submitReview(taskId),
    onMutate: () => optimisticStatusUpdate('IN_REVIEW'),
    onError,
    onSettled: invalidate 
  });
  
  const accept          = useMutation({ 
    mutationFn: () => tasksApi.accept(taskId),
    onMutate: () => optimisticStatusUpdate('COMPLETED'),
    onError,
    onSettled: invalidate 
  });
  
  const requestRevision = useMutation({ 
    mutationFn: (d) => tasksApi.requestRevision(taskId, d),
    onMutate: () => optimisticStatusUpdate('IN_PROGRESS'),
    onError,
    onSettled: invalidate 
  });
  
  const cancel          = useMutation({ 
    mutationFn: () => tasksApi.cancel(taskId),
    onMutate: () => optimisticStatusUpdate('CANCELED'),
    onError,
    onSettled: invalidate 
  });
  
  const dispute         = useMutation({ 
    mutationFn: (d) => tasksApi.dispute(taskId, d),
    onMutate: () => optimisticStatusUpdate('DISPUTED'),
    onError,
    onSettled: invalidate 
  });

  const promote         = useMutation({ 
    mutationFn: (d) => tasksApi.promote(taskId, d),
    onSuccess: () => {
      invalidate();
      toast.success("Vazifa muvaffaqiyatli ko'tarildi!");
    },
    onError: (err) => toast.error(err.serverMsg || "Xatolik yuz berdi")
  });

  return { startProgress, submitReview, accept, requestRevision, cancel, dispute, promote };
}

// ─── Bids ───────────────────────────────────────────
export function useTaskBids(taskId) {
  return useQuery({
    queryKey: ['tasks', taskId, 'bids'],
    queryFn:  () => bidsApi.getByTask(taskId).then((r) => r.data.data),
    enabled:  !!taskId,
    staleTime: 15 * 1000,
  });
}

export function useCreateBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => bidsApi.create(data).then((r) => r.data.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', vars.taskId, 'bids'] });
      qc.invalidateQueries({ queryKey: ['task', vars.taskId] });
      toast.success('Taklif yuborildi!');
    },
    onError: (err) => {
      if (err.serverErrors) {
        toast.error('Iltimos, xatoliklarni to\'g\'irlang');
      } else if (err.serverCode === 'ACADEMIC_FRAUD_DETECTED') {
        toast.error("Bu so'rov taqiqlangan: akademik halollik siyosati");
      } else {
        toast.error(err.serverMsg || 'Taklif yuborishda xato');
      }
    },
  });
}

export function useAcceptBid(taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bidId) => bidsApi.accept(taskId, { bidId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task', taskId] });
      qc.invalidateQueries({ queryKey: ['tasks', taskId, 'bids'] });
      toast.success('Taklif qabul qilindi!');
    },
    onError: (err) => toast.error(err.serverMsg || 'Xato yuz berdi'),
  });
}
