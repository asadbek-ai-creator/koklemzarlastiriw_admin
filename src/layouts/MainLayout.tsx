import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  TreePine,
  Users,
  Sprout,
  ScrollText,
  LogOut,
  Leaf,
  Globe,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { UserRole } from '@/shared/types/api.types';

// ── Sidebar navigation config ───────────────────────────────

interface NavItem {
  titleKey: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    titleKey: 'nav.dashboard',
    path: '/dashboard',
    icon: BarChart3,
    roles: ['super_admin', 'admin', 'district_admin', 'auditor'],
  },
  {
    titleKey: 'nav.applications',
    path: '/applications',
    icon: TreePine,
    roles: ['super_admin', 'admin', 'district_admin', 'auditor'],
  },
  {
    titleKey: 'nav.users',
    path: '/users',
    icon: Users,
    roles: ['super_admin', 'admin'],
  },
  {
    titleKey: 'nav.inspections',
    path: '/inspections',
    icon: Sprout,
    roles: ['super_admin', 'admin', 'auditor'],
  },
  {
    titleKey: 'nav.districts',
    path: '/districts',
    icon: MapPin,
    roles: ['super_admin'],
  },
  {
    titleKey: 'nav.auditLogs',
    path: '/audit-logs',
    icon: ScrollText,
    roles: ['super_admin'],
  },
];

// ── Component ───────────────────────────────────────────────

export default function MainLayout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru');
  };

  const handleLogout = () => {
    logout();
    toast.success(t('nav.loggedOutSuccess'));
    navigate('/login', { replace: true });
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        {/* ── Left sidebar ── */}
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="cursor-default">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">{t('nav.appName')}</span>
                    <span className="text-xs text-muted-foreground">
                      {t('nav.appTagline')}
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{t('nav.navigation')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={location.pathname.startsWith(item.path)}
                        onClick={() => navigate(item.path)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{t(item.titleKey)}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarSeparator />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground">
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium text-foreground">
                      {user?.full_name}
                    </span>
                    <span className="text-xs">{user ? t(`role.${user.role}`) : ''}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>{t('common.logout')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* ── Main content ── */}
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm font-medium capitalize text-muted-foreground">
              {location.pathname.split('/').filter(Boolean).join(' / ')}
            </span>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-1.5">
                <Globe className="h-4 w-4" />
                {i18n.language === 'ru' ? 'EN' : 'RU'}
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
