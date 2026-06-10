import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../store/authStore';
import { act, renderHook } from '@testing-library/react';

vi.mock('../../services/auth.service', () => ({
  authApi: {
    logout: vi.fn().mockResolvedValue({})
  }
}));

describe('authStore', () => {
  beforeEach(() => {
    const store = useAuthStore.getState();
    act(() => {
      store.setAuth({ user: null, token: null });
    });
  });

  it('login qilganda token va user saqlanishi kerak', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setAuth({
        user: { id: '1', fullname: 'Test', isFreelancer: false },
        token: 'test-token',
      });
    });
    
    expect(result.current.token).toBe('test-token');
    expect(result.current.user?.fullname).toBe('Test');
    expect(result.current.activeRole).toBe('CLIENT');
  });

  it('freelancer sifatida login qilganda activeRole FREELANCER bo\'lishi kerak', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setAuth({
        user: { id: '1', fullname: 'Test', isFreelancer: true },
        token: 'test-token',
      });
    });
    
    expect(result.current.activeRole).toBe('FREELANCER');
  });

  it('logout qilinganda barcha state tozalanishi kerak', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setAuth({ user: { id: '1' }, token: 'token' });
    });
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
