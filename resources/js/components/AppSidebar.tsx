import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  LayoutDashboard, Users, Building2, Settings, GraduationCap,
  Layers, CreditCard, Receipt, FileText, Wallet, Calendar, BookOpen, Sparkles,
  Heart, ClipboardList, Megaphone, UserCheck, FolderOpen,
  Scale, ArrowLeftRight, BarChart3, Plug, ShieldCheck,
  Package, Activity, Monitor, KeyRound,
} from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { cn } from '@/lib/utils';
import type { ModuleKey } from '@/types';
import feeyanguLogo from '@/assets/feeyangu-logo.png';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, Building2, Settings, GraduationCap, Layers, CreditCard,
  Receipt, FileText, Wallet, Calendar, BookOpen, Sparkles, Heart, ClipboardList,
  Megaphone, UserCheck, FolderOpen, Scale, ArrowLeftRight, BarChart3, Plug, ShieldCheck,
  Package, Activity, Monitor, KeyRound,
};

interface SidebarNavItem { title: string; url: string; icon: string; moduleKey?: ModuleKey; }
interface SidebarNavSection { label: string; moduleKey?: ModuleKey; items: SidebarNavItem[]; }

const AppSidebar: React.FC = () => {
  const { auth } = usePage().props as { auth: { user: { name: string; role: string } } };
  const user = auth?.user;
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { url } = usePage();
  const t = useT();
  const { isEnabled } = useModuleAccess();

  const superAdminNav: SidebarNavSection[] = [
    { label: t.SIDEBAR_TEXT.superAdmin.label, items: [
      { title: t.SIDEBAR_TEXT.superAdmin.items.dashboard, url: '/admin/dashboard', icon: 'LayoutDashboard' },
      { title: t.SIDEBAR_TEXT.superAdmin.items.schools, url: '/admin/schools', icon: 'Building2' },
      { title: t.SIDEBAR_TEXT.superAdmin.items.users, url: '/admin/users', icon: 'Users' },
      { title: t.SIDEBAR_TEXT.superAdmin.items.settings, url: '/admin/settings', icon: 'Settings' },
    ]},
    { label: 'Subscription & Usage', items: [
      { title: 'Module Management', url: '/admin/module-management', icon: 'Package' },
      { title: 'Subscription Plans', url: '/admin/subscription-plans', icon: 'Sparkles' },
      { title: 'School Usage', url: '/admin/schools/usage', icon: 'Activity' },
    ]},
  ];

  const schoolAdminNav: SidebarNavSection[] = [
    { label: 'Overview', items: [
      { title: 'Dashboard', url: '/school/dashboard', icon: 'LayoutDashboard' },
    ]},
    { label: 'Academics', moduleKey: 'academics', items: [
      { title: 'Academics Hub', url: '/school/academics', icon: 'BookOpen', moduleKey: 'academics' },
      { title: 'Curricula', url: '/school/academics/curricula', icon: 'BookOpen', moduleKey: 'academics' },
      { title: 'Subjects', url: '/school/academics/subjects', icon: 'ClipboardList', moduleKey: 'academics' },
      { title: 'Exams', url: '/school/academics/exams', icon: 'FileText', moduleKey: 'academics' },
      { title: 'Grade Scales', url: '/school/academics/grade-scales', icon: 'Scale', moduleKey: 'academics' },
      { title: 'Grades & Classes', url: '/school/grades', icon: 'GraduationCap', moduleKey: 'academics' },
      { title: 'Terms', url: '/school/terms', icon: 'Calendar', moduleKey: 'academics' },
      { title: 'Students', url: '/school/students', icon: 'Users', moduleKey: 'academics' },
    ]},
    { label: t.SIDEBAR_TEXT.schoolAdmin.finance.label, moduleKey: 'finance', items: [
      { title: t.SIDEBAR_TEXT.schoolAdmin.finance.items.feeStructures, url: '/school/fee-structures', icon: 'FileText', moduleKey: 'finance' },
      { title: 'Payment Methods', url: '/school/payment-methods', icon: 'Wallet', moduleKey: 'finance' },
      { title: t.SIDEBAR_TEXT.schoolAdmin.finance.items.payments, url: '/school/payments', icon: 'CreditCard', moduleKey: 'finance' },
      { title: t.SIDEBAR_TEXT.schoolAdmin.finance.items.receipts, url: '/school/receipts', icon: 'Receipt', moduleKey: 'finance' },
    ]},
    { label: 'Health', moduleKey: 'health', items: [
      { title: 'Health Records', url: '/school/health', icon: 'Heart', moduleKey: 'health' },
    ]},
    { label: 'PT Meetings', moduleKey: 'pt_meetings', items: [
      { title: 'PT Meetings', url: '/school/pt-meetings', icon: 'Calendar', moduleKey: 'pt_meetings' },
    ]},
    { label: t.SIDEBAR_TEXT.schoolAdmin.settings.label, items: [
      { title: 'Staff Management', url: '/school/users', icon: 'UserCheck' },
      { title: 'Modules', url: '/school/modules', icon: 'Layers' },
      { title: 'Dashboard Config', url: '/school/dashboard-config', icon: 'Monitor' },
      { title: t.SIDEBAR_TEXT.schoolAdmin.settings.items.settings, url: '/school/settings', icon: 'Settings' },
      { title: 'Subscription', url: '/school/subscription', icon: 'Sparkles' },
    ]},
  ];

  const parentNav: SidebarNavSection[] = [
    { label: t.SIDEBAR_TEXT.parent.label, items: [
      { title: t.SIDEBAR_TEXT.parent.items.dashboard, url: '/parent/dashboard', icon: 'LayoutDashboard' },
      { title: t.SIDEBAR_TEXT.parent.items.children, url: '/parent/children', icon: 'Users' },
      { title: t.SIDEBAR_TEXT.parent.items.payments, url: '/parent/payments', icon: 'CreditCard' },
      { title: t.SIDEBAR_TEXT.parent.items.receipts, url: '/parent/receipts', icon: 'Receipt' },
      { title: t.SIDEBAR_TEXT.parent.items.ptMeetings, url: '/parent/pt-meetings', icon: 'Calendar', moduleKey: 'pt_meetings' },
    ]},
  ];

  const accountantNav: SidebarNavSection[] = [
    { label: t.SIDEBAR_ACCOUNTANT.label, items: [
      { title: t.SIDEBAR_ACCOUNTANT.items.dashboard, url: '/accountant/dashboard', icon: 'LayoutDashboard' },
      { title: t.SIDEBAR_ACCOUNTANT.items.feeStructures, url: '/accountant/fee-structures', icon: 'FileText' },
      { title: t.SIDEBAR_ACCOUNTANT.items.invoicing, url: '/accountant/invoicing', icon: 'Receipt' },
      { title: t.SIDEBAR_ACCOUNTANT.items.payments, url: '/accountant/payments', icon: 'CreditCard' },
      { title: t.SIDEBAR_ACCOUNTANT.items.reconciliation, url: '/accountant/reconciliation', icon: 'ArrowLeftRight' },
      { title: t.SIDEBAR_ACCOUNTANT.items.reports, url: '/accountant/reports', icon: 'BarChart3' },
      { title: t.SIDEBAR_ACCOUNTANT.items.expenses, url: '/accountant/expenses', icon: 'Scale' },
      { title: t.SIDEBAR_ACCOUNTANT.items.integrations, url: '/accountant/integrations', icon: 'Plug' },
      { title: t.SIDEBAR_ACCOUNTANT.items.paymentGateway, url: '/accountant/payment-gateway', icon: 'Wallet' },
    ]},
  ];

  const rawNav = user?.role === 'super_admin' ? superAdminNav
    : user?.role === 'school_admin' ? schoolAdminNav
    : user?.role === 'accountant' ? accountantNav
    : parentNav;

  // Filter sections and items based on enabled modules.
  // Super admin always sees everything.
  const navSections: SidebarNavSection[] = user?.role === 'super_admin'
    ? rawNav
    : rawNav
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) => !item.moduleKey || isEnabled(item.moduleKey)
          ),
        }))
        .filter((section) => section.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
        <div className={cn('flex items-center gap-3 px-4 py-4 pt-5', collapsed && 'justify-center px-3')}>
          <img src={feeyanguLogo} alt="Feeyangu" className="h-11 w-11 rounded-md object-contain flex-shrink-0" />
          {!collapsed && <span className="font-bold text-lg text-foreground tracking-tight">{t.APP_NAME}</span>}
        </div>
      </div>

      <SidebarContent className="px-2 py-3">
        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-1 px-3">
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon] || LayoutDashboard;
                  const isActive = url === item.url || url.startsWith(item.url + '/');
                  const linkContent = (
                    <Link href={item.url}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-[3px] border-primary'
                      )}>
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  );
                  if (collapsed) {
                    return (
                      <SidebarMenuItem key={item.url}>
                        <Tooltip>
                          <TooltipTrigger asChild><SidebarMenuButton asChild isActive={isActive}>{linkContent}</SidebarMenuButton></TooltipTrigger>
                          <TooltipContent side="right" className="font-medium">{item.title}</TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  }
                  return (<SidebarMenuItem key={item.url}><SidebarMenuButton asChild isActive={isActive}>{linkContent}</SidebarMenuButton></SidebarMenuItem>);
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed ? (
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
            <h4 className="text-xs font-bold text-primary mb-1">💰 Feeyangu</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Smart school fee management made simple.
            </p>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-lg bg-primary/10 border border-primary/20 cursor-pointer"><span className="text-sm">💰</span></div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px]">
              <p className="font-bold text-xs mb-1">Feeyangu</p>
              <p className="text-[11px]">Smart school fee management.</p>
            </TooltipContent>
          </Tooltip>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
