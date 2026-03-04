import { create } from 'zustand';

import { storage } from '@/utils/storage';

interface UserProfile {
  id: string;
  username: string;
  nickname: string;
}

interface AuthState {
  accessToken: string;
  refreshToken: string;
  user: UserProfile | null;
  setAuth: (payload: { accessToken: string; refreshToken: string; user: UserProfile }) => void;
  clearAuth: () => void;
}

const AUTH_KEY = 'narcissus-auth';

const initialState = storage.get<Omit<AuthState, 'setAuth' | 'clearAuth'>>(AUTH_KEY, {
  accessToken: '',
  refreshToken: '',
  user: null,
});

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setAuth(payload) {
    storage.set(AUTH_KEY, payload);
    set(payload);
  },
  clearAuth() {
    storage.remove(AUTH_KEY);
    set({ accessToken: '', refreshToken: '', user: null });
  },
}));
