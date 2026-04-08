import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/shared/types/api.types';
import { tokenStorage } from '@/shared/lib/token.storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// ─────────────────────────────────────────────────────────────
// Auth store
//
// `user` and `isAuthenticated` are persisted in localStorage so
// the router can decide what to render synchronously on F5 —
// no waiting for /auth/me to round-trip. The /auth/me call still
// happens in the background (see useAuthInit) to revalidate the
// token and refresh the user object, but it does NOT gate the UI.
// `isLoading` is intentionally NOT persisted.
// ─────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        tokenStorage.setTokens(accessToken, refreshToken);
        set({ user, isAuthenticated: true, isLoading: false });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: true, isLoading: false });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      logout: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
