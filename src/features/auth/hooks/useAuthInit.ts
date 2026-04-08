import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { authService } from '@/features/auth/auth.service';
import { tokenStorage } from '@/shared/lib/token.storage';

/**
 * Background token revalidation. The store is rehydrated synchronously
 * from localStorage by the persist middleware, so the router renders
 * immediately on F5 with the correct user. This hook just verifies the
 * token in the background and refreshes the user object.
 *
 * - No token in storage → clear any stale persisted state.
 * - Token present + /auth/me OK → refresh user in store.
 * - Token present + /auth/me 401 → axios interceptor handles refresh
 *   (and forceLogout if refresh also fails). The .catch here is just
 *   to silence unhandled rejections.
 */
export function useAuthInit() {
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const hasToken = !!tokenStorage.getAccessToken();
    if (!hasToken) {
      logout();
      return;
    }

    authService
      .me()
      .then(({ data }) => setUser(data.data))
      .catch(() => {
        // Interceptor already handled it.
      });
  }, [setUser, logout]);
}
