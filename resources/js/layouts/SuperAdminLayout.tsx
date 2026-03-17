import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  LayoutDashboard, Building2, Users, Settings, Package,
  LogOut, ChevronRight, Layers, Sparkles, Activity,
} from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import feeyanguLogo from '@/assets/feeyangu-logo.png';

interface Props {
  children: React.ReactNode;
}

const superAdminNav = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Schools', url: '/admin/schools', icon: Building2 },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Modules', url: '/admin/modules', icon: Layers },
  { title: 'Module Management', url: '/admin/module-management', icon: Package },
  { title: 'Subscription Plans', url: '/admin/subscription-plans', icon: Sparkles },
  { title: 'School Usage', url: '/admin/schools/usage', icon: Activity },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

const SuperAdminLayout: React.FC<Props> = ({ children }) => {
  const { url } = usePage();
  const t = useT();

  const isActive = (path: string) => url === path || url.startsWith(path + '/');

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r bg-card">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-14 border-b">
          <img src={feeyanguLogo} alt="Feeyangu" className="h-7 w-auto" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {superAdminNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.title}
                {active && <ChevronRight className="ml-auto h-3 w-3" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-4 border-t">
          <Link
            href="/logout"
            method="post"
            as="button"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b flex items-center px-6 gap-4 bg-card">
          <span className="font-semibold text-sm text-foreground">
            {t.APP_NAME} — Super Admin
          </span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
