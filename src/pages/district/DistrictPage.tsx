import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function DistrictPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">{t('district.title')}</h1>
      <p className="text-muted-foreground">
        {t('district.signedInAs', {
          name: user?.full_name,
          role: user ? t(`role.${user.role}`) : '',
        })}
      </p>
    </div>
  );
}
