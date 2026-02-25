import React, { useState } from 'react'; // fixed
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Globe, ChevronRight, Moon, Sun, Settings } from 'lucide-react';
import SteppedMenuIcon from '@/components/SteppedMenuIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { Language } from '@/lib/i18n';
import schoolLogo from '@/assets/school-logo.png';
import feeyanguLogo from '@/assets/feeyangu-logo.png';
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const langFlags: Record<Language, string> = { en: '🇬🇧', fr: '🇫🇷', de: '🇩🇪', nl: '🇳🇱', sw: '🇰🇪' };

const Header: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  const roleLabelMap = t.HEADER.roleLabels;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const brandLogo = user?.role === 'super_admin' ? feeyanguLogo : schoolLogo;
  const brandName = user?.role === 'super_admin' ? 'Feeyangu' : user?.schoolName;

  return (
    <header className="h-14 border-b border-border bg-primary flex items-center justify-between px-4 sticky top-0 z-30">
      {/* Left: sidebar trigger (desktop) + branding */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="hidden lg:flex text-primary-foreground/80 hover:text-primary-foreground" />
        {brandName && (
          <div className="flex items-center gap-1.5">
            <img src={brandLogo} alt={brandName} className="h-9 w-9 rounded-full bg-white/90 object-contain p-0.5" />
            <span className="text-xs sm:text-sm font-bold text-primary-foreground tracking-tight truncate max-w-[120px] sm:max-w-xs">
              {brandName}
            </span>
          </div>
        )}
      </div>

      {/* Right: desktop/tablet actions */}
      <div className="hidden lg:flex items-center gap-1.5">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-warning text-warning-foreground text-[10px] flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-3 border-b border-border">
              <p className="font-semibold text-sm">{t.COMMON_TEXT.notifications}</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div key={n.id} className={`p-3 border-b border-border last:border-0 ${!n.read ? 'bg-accent' : ''}`}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile dropdown with role switcher, language, theme */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-primary-foreground hover:bg-primary-foreground/10">
              <div className="h-7 w-7 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium hidden lg:inline">{user?.name}</span>
              <ChevronDown className="h-3 w-3 text-primary-foreground/60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* User info */}
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                {user?.role && roleLabelMap[user.role]}
              </p>
            </div>

            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              {t.COMMON_TEXT.profile}
            </DropdownMenuItem>

            {/* Theme toggle */}
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </DropdownMenuItem>

            {/* Language sub-menu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Globe className="h-4 w-4 mr-2" />
                {langFlags[language]} {t.LANGUAGE[language]}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {(['en', 'fr', 'de', 'nl', 'sw'] as Language[]).map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={language === lang ? 'bg-accent font-semibold' : ''}
                  >
                    {langFlags[lang]} {t.LANGUAGE[lang]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Role switcher sub-menu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="h-4 w-4 mr-2" />
                Switch Role
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {([
                  { role: 'super_admin' as UserRole, path: '/admin/dashboard' },
                  { role: 'school_admin' as UserRole, path: '/school/dashboard' },
                  { role: 'accountant' as UserRole, path: '/accountant/dashboard' },
                  { role: 'parent' as UserRole, path: '/parent/dashboard' },
                ]).map(({ role, path }) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => { switchRole(role); navigate(path); }}
                    className={user?.role === role ? 'bg-accent font-semibold' : ''}
                  >
                    {roleLabelMap[role]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              {t.COMMON_TEXT.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: mobile actions */}
      <div className="flex lg:hidden items-center gap-1">
        {/* Notification bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-warning text-warning-foreground text-[10px] flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0 z-50">
            <div className="p-3 border-b border-border">
              <p className="font-semibold text-sm">{t.COMMON_TEXT.notifications}</p>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div key={n.id} className={`p-3 border-b border-border last:border-0 ${!n.read ? 'bg-accent' : ''}`}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Hamburger menu sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8">
              <SteppedMenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0 z-50">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="py-2">
              {/* Theme toggle */}
              <div className="px-4 py-2">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between text-sm px-3 py-2.5 rounded-md hover:bg-accent transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    {theme === 'dark' ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
              </div>

              <div className="h-px bg-border mx-4 my-1" />

              {/* Language section */}
              <div className="px-4 py-2">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  <Globe className="h-3 w-3 inline mr-1.5" />
                  {t.LANGUAGE.label}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['en', 'fr', 'de', 'nl', 'sw'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={cn(
                        'text-xs px-3 py-2 rounded-md text-left transition-colors',
                        language === lang
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'bg-muted hover:bg-accent'
                      )}
                    >
                      {langFlags[lang]} {t.LANGUAGE[lang]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border mx-4 my-1" />

              {/* Role switcher section */}
              <div className="px-4 py-2">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Switch Role
                </p>
                <div className="space-y-1">
                  {([
                    { role: 'super_admin' as UserRole, path: '/admin/dashboard' },
                    { role: 'school_admin' as UserRole, path: '/school/dashboard' },
                    { role: 'accountant' as UserRole, path: '/accountant/dashboard' },
                    { role: 'parent' as UserRole, path: '/parent/dashboard' },
                  ]).map(({ role, path }) => (
                    <button
                      key={role}
                      onClick={() => { switchRole(role); navigate(path); setMobileOpen(false); }}
                      className={cn(
                        'w-full flex items-center justify-between text-sm px-3 py-2.5 rounded-md transition-colors',
                        user?.role === role
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'hover:bg-accent'
                      )}
                    >
                      {roleLabelMap[role]}
                      <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border mx-4 my-1" />

              {/* Profile & settings */}
              <div className="px-4 py-2 space-y-1">
                <button className="w-full flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-md hover:bg-accent transition-colors">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {t.COMMON_TEXT.profile}
                </button>
              </div>

              <div className="h-px bg-border mx-4 my-1" />

              {/* Logout */}
              <div className="px-4 py-2">
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t.COMMON_TEXT.logout}
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
