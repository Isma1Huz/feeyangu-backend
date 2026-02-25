import React from 'react';
import { router, usePage } from '@inertiajs/react';
import {
  LayoutDashboard, Users, Building2, Settings, GraduationCap,
  CreditCard, Receipt, FileText, Wallet, Calendar, Layers,
  BookOpen, ClipboardList, Heart, FolderOpen, Megaphone, UserCheck,
  ArrowLeftRight, BarChart3, Scale,
} from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, Building2, Settings, GraduationCap,
  CreditCard, Receipt, FileText, Wallet, Calendar, Layers,
  BookOpen, ClipboardList, Heart, FolderOpen, Megaphone, UserCheck,
  ArrowLeftRight, BarChart3, Scale,
};

interface NavItem {
  title: string;
  url: string;
  icon: string;
}

const BottomNav: React.FC = () => {
  const { auth } = usePage().props as { auth: { user: { role: string } } };
  const user = auth?.user;
  const { url } = usePage();
  const t = useT();

  const superAdminItems: NavItem[] = [
    { title: t.SIDEBAR_TEXT.superAdmin.items.dashboard, url: '/admin/dashboard', icon: 'LayoutDashboard' },
    { title: t.SIDEBAR_TEXT.superAdmin.items.schools, url: '/admin/schools', icon: 'Building2' },
    { title: t.SIDEBAR_TEXT.superAdmin.items.users, url: '/admin/users', icon: 'Users' },
    { title: t.SIDEBAR_TEXT.superAdmin.items.settings, url: '/admin/settings', icon: 'Settings' },
  ];

  const schoolAdminItems: NavItem[] = [
    { title: t.SIDEBAR_TEXT.schoolAdmin.main.items.dashboard, url: '/school/dashboard', icon: 'LayoutDashboard' },
    { title: t.SIDEBAR_TEXT.schoolAdmin.finance.items.payments, url: '/school/payments', icon: 'CreditCard' },
    { title: t.SIDEBAR_TEXT.schoolAdmin.finance.items.receipts, url: '/school/receipts', icon: 'Receipt' },
    { title: t.SIDEBAR_TEXT.schoolAdmin.settings.items.settings, url: '/school/settings', icon: 'Settings' },
  ];

  const parentItems: NavItem[] = [
    { title: t.SIDEBAR_TEXT.parent.items.dashboard, url: '/parent/dashboard', icon: 'LayoutDashboard' },
    { title: t.SIDEBAR_TEXT.parent.items.children, url: '/parent/children', icon: 'Users' },
    { title: t.SIDEBAR_TEXT.parent.items.payments, url: '/parent/payments', icon: 'CreditCard' },
    { title: t.SIDEBAR_TEXT.parent.items.receipts, url: '/parent/receipts', icon: 'Receipt' },
  ];

  const accountantItems: NavItem[] = [
    { title: 'Dashboard', url: '/accountant/dashboard', icon: 'LayoutDashboard' },
    { title: 'Invoicing', url: '/accountant/invoicing', icon: 'Receipt' },
    { title: 'Payments', url: '/accountant/payments', icon: 'CreditCard' },
    { title: 'Reconcile', url: '/accountant/reconciliation', icon: 'ArrowLeftRight' },
    { title: 'Reports', url: '/accountant/reports', icon: 'BarChart3' },
  ];

  const items = user?.role === 'super_admin' ? superAdminItems
    : user?.role === 'school_admin' ? schoolAdminItems
    : user?.role === 'accountant' ? accountantItems
    : parentItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Clean white background with subtle top border */}
      <div className="absolute inset-0 bg-card border-t border-border/60 shadow-[0_-2px_16px_-4px_hsl(var(--foreground)/0.06)]" />
      
      <div className="relative flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] h-[68px]">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = url === item.url;
          const shortLabel = item.title.split(' ')[0];

          return (
            <button
              key={item.url}
              onClick={() => router.visit(item.url)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-300 relative',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground/70 active:scale-90'
              )}
            >
              {/* Active background bubble */}
              <div className={cn(
                'flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300',
                isActive
                  ? 'bg-primary/10 scale-100'
                  : 'bg-transparent scale-90'
              )}>
                <Icon className={cn(
                  'transition-all duration-300',
                  isActive
                    ? 'h-[22px] w-[22px] stroke-[2.5px] text-primary'
                    : 'h-5 w-5 stroke-[1.5px]'
                )} />
              </div>

              <span className={cn(
                'text-[10px] leading-none transition-all duration-300',
                isActive
                  ? 'font-bold text-primary'
                  : 'font-medium text-muted-foreground/60'
              )}>
                {shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
