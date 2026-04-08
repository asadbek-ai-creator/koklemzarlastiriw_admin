import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  TreePine,
  Users,
  Sprout,
  ScrollText,
  LogOut,
  Leaf,
} from 'lucide-react';
import { toast } from 'sonner';
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
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: BarChart3,
    roles: ['super_admin', 'admin', 'district_admin', 'auditor'],
  },
  {
    title: 'Applications',
    path: '/applications',
    icon: TreePine,
    roles: ['super_admin', 'admin', 'district_admin', 'auditor'],
  },
  {
    title: 'Users',
    path: '/users',
    icon: Users,
    roles: ['super_admin', 'admin'],
  },
  {
    title: 'Inspections',
    path: '/inspections',
    icon: Sprout,
    roles: ['super_admin', 'admin', 'auditor'],
  },
  {
    title: 'Audit Logs',
    path: '/audit-logs',
    icon: ScrollText,
    roles: ['super_admin'],
  },
];

// ── Component ───────────────────────────────────────────────

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
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
                    <span className="font-semibold">Ozelenenie</span>
                    <span className="text-xs text-muted-foreground">
                      Tree & Irrigation Tracker
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={location.pathname.startsWith(item.path)}
                        onClick={() => navigate(item.path)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
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
                    <span className="text-xs">{user?.role.replace('_', ' ')}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
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
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
