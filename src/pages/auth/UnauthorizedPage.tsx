import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <ShieldAlert className="h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-bold">{t('unauthorized.title')}</h1>
      <p className="text-muted-foreground">
        {t('unauthorized.message')}
      </p>
      <Button variant="outline" onClick={() => navigate('/dashboard', { replace: true })}>
        {t('unauthorized.goToDashboard')}
      </Button>
    </div>
  );
}
