import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useAuthInit } from '@/features/auth/hooks/useAuthInit';
import AppRouter from '@/app/routes/AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function AuthGate() {
  // Background token revalidation. Does NOT gate the router —
  // the auth store is hydrated synchronously from localStorage
  // by zustand's persist middleware, so the router can match and
  // render the current URL on F5 without waiting for /auth/me.
  useAuthInit();
  return <AppRouter />;
}

async function enableMocking(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return;

  const { worker } = await import('@/mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

export default function AppProviders() {
  const [mockReady, setMockReady] = useState(
    import.meta.env.VITE_USE_MOCK !== 'true',
  );

  useEffect(() => {
    if (!mockReady) {
      enableMocking().then(() => setMockReady(true));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mockReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
