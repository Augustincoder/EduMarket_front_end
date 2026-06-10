import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyTasks } from '../../hooks/useTasks';
import { tasksApi } from '../../services/tasks.service';

vi.mock('../../services/tasks.service', () => ({
  tasksApi: {
    getMyTasks: vi.fn(),
    create: vi.fn(),
  }
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useMyTasks hook', () => {
  it('API orqali tasklarni yuklashi va holatni ko\'rsatishi kerak', async () => {
    tasksApi.getMyTasks.mockResolvedValue({
      data: { data: [{ id: '1', title: 'Test task', status: 'OPEN' }] }
    });
    
    const { result } = renderHook(() => useMyTasks('CLIENT', 'OPEN'), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].title).toBe('Test task');
  });
});

import { useCreateTask } from '../../hooks/useTasks';
describe('useCreateTask hook', () => {
  it('muvaffaqiyatli task yaratilganda onSuccess chaqirilishi kerak', async () => {
    tasksApi.create.mockResolvedValue({
      data: { data: { id: '2', title: 'Yangi vazifa' } }
    });

    const { result } = renderHook(() => useCreateTask(), { wrapper });

    result.current.mutate({ title: 'Yangi vazifa' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(tasksApi.create).toHaveBeenCalledWith({ title: 'Yangi vazifa' });
  });
});
