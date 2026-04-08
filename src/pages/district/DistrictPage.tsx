import { useAuthStore } from '@/features/auth/store/auth.store';

export default function DistrictPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">District workspace</h1>
      <p className="text-muted-foreground">
        Signed in as <span className="font-medium">{user?.full_name}</span>{' '}
        ({user?.role})
      </p>
    </div>
  );
}
