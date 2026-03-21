import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  LayoutDashboard,
  GraduationCap,
  DollarSign,
  Heart,
  Calendar,
  Settings,
  Users,
  Layers,
} from 'lucide-react';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { cn } from '@/lib/utils';
import type { ModuleKey } from '@/types';
import feeyanguLogo from '@/assets/feeyangu-logo.png';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PrimaryNavItem {
  name: string;
  url: string;
  icon: React.ElementType;
  moduleKey?: ModuleKey;
  /** Match any URL that starts with one of these prefixes */
  matchPrefixes: string[];
}

const navItems: PrimaryNavItem[] = [
  {
    name: 'Dashboard',
    url: '/school/dashboard',
    icon: LayoutDashboard,
    matchPrefixes: ['/school/dashboard'],
  },
  {
    name: 'Academics',
    url: '/school/academics',
    icon: GraduationCap,
    moduleKey: 'academics',
    matchPrefixes: ['/school/academics'],
  },
  {
    name: 'Finance',
    url: '/school/fee-structures',
    icon: DollarSign,
    moduleKey: 'finance',
    matchPrefixes: [
      '/school/fee-structures',
      '/school/payment-methods',
      '/school/payments',
      '/school/receipts',
    ],
  },
  {
    name: 'Health',
    url: '/school/health',
    icon: Heart,
    moduleKey: 'health',
    matchPrefixes: ['/school/health'],
  },
  {
    name: 'PT Meetings',
    url: '/school/pt-meetings',
    icon: Calendar,
    moduleKey: 'pt_meetings',
    matchPrefixes: ['/school/pt-meetings'],
  },
  {
    name: 'Modules',
    url: '/school/modules',
    icon: Layers,
    matchPrefixes: ['/school/modules'],
  },
  {
    name: 'Staff',
    url: '/school/users',
    icon: Users,
    matchPrefixes: ['/school/users'],
  },
  {
    name: 'Settings',
    url: '/school/settings',
    icon: Settings,
    matchPrefixes: ['/school/settings'],
  },
];

interface PrimarySidebarProps {
  className?: string;
}

export const PrimarySidebar: React.FC<PrimarySidebarProps> = ({ className }) => {
  const { url } = usePage();
  const { isEnabled } = useModuleAccess();

  const visibleItems = navItems.filter(
    (item) => !item.moduleKey || isEnabled(item.moduleKey),
  );

  return (
    <aside
      className={cn(
        'w-16 shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0 z-40',
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-sidebar-border shrink-0">
        <Link href="/school/dashboard">
          <img
            src={feeyanguLogo}
            alt="Feeyangu"
            className="h-9 w-9 rounded-md object-contain"
          />
        </Link>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 flex flex-col items-center gap-1 py-3 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.matchPrefixes.some(
            (prefix) => url === prefix || url.startsWith(prefix + '/'),
          );

          return (
            <Tooltip key={item.url}>
              <TooltipTrigger asChild>
                <Link
                  href={item.url}
                  className={cn(
                    'flex items-center justify-center h-10 w-10 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {item.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex items-center justify-center h-12 border-t border-sidebar-border shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-base cursor-default select-none">💰</span>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-bold text-xs">Feeyangu</p>
            <p className="text-[11px]">Smart school fee management.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};

export default PrimarySidebar;
