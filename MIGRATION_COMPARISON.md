# Navigation Components: Before & After Migration

## 1. AppSidebar.tsx

### Before (React Router)
```typescript
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// ... other imports ...
import { NavLink } from '@/components/NavLink';

const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();  // ❌ OLD
  const navigate = useNavigate();   // ❌ OLD
  const t = useT();

  // ... menu definitions ...

  return (
    <Sidebar>
      {/* ... */}
      {section.items.map((item) => {
        const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/');  // ❌ OLD
        const linkContent = (
          <NavLink to={item.url}                                    {/* ❌ OLD: to prop */}
            className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors', '...')}
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-[3px] border-primary">  {/* ❌ OLD */}
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        );
        // ... render logic ...
      })}
    </Sidebar>
  );
};
```

### After (Inertia.js)
```typescript
import React from 'react';
import { Link, usePage } from '@inertiajs/react';  // ✅ NEW
// ... other imports ...
// NOTE: NavLink no longer imported here (not needed for direct Link usage)

const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { url } = usePage();  // ✅ NEW: Inertia hook
  const t = useT();

  // ... menu definitions ...

  return (
    <Sidebar>
      {/* ... */}
      {section.items.map((item) => {
        const isActive = url === item.url || url.startsWith(item.url + '/');  // ✅ NEW: Inertia URL
        const linkContent = (
          <Link href={item.url}                                    {/* ✅ NEW: href prop */}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-[3px] border-primary'  {/* ✅ NEW: Conditional */}
            )}>
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        );
        // ... render logic ...
      })}
    </Sidebar>
  );
};
```

---

## 2. BottomNav.tsx

### Before (React Router)
```typescript
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';  // ❌ OLD
// ... other imports ...

const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();  // ❌ OLD
  const navigate = useNavigate();   // ❌ OLD
  const t = useT();

  // ... menu definitions ...

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="relative flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] h-[68px]">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = location.pathname === item.url;  // ❌ OLD
          const shortLabel = item.title.split(' ')[0];

          return (
            <button
              key={item.url}
              onClick={() => navigate(item.url)}  {/* ❌ OLD: useNavigate */}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-300 relative',
                isActive ? 'text-primary' : 'text-muted-foreground/70 active:scale-90'
              )}
            >
              {/* ... icon and label ... */}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
```

### After (Inertia.js)
```typescript
import React from 'react';
import { router, usePage } from '@inertiajs/react';  // ✅ NEW
// ... other imports ...

const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const { url } = usePage();  // ✅ NEW: Inertia hook
  const t = useT();

  // ... menu definitions ...

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="relative flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] h-[68px]">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = url === item.url;  // ✅ NEW: Inertia URL
          const shortLabel = item.title.split(' ')[0];

          return (
            <button
              key={item.url}
              onClick={() => router.visit(item.url)}  {/* ✅ NEW: Inertia router */}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-300 relative',
                isActive ? 'text-primary' : 'text-muted-foreground/70 active:scale-90'
              )}
            >
              {/* ... icon and label ... */}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
```

---

## 3. Header.tsx

### Before (React Router)
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // ❌ OLD
// ... other imports ...

const Header: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();  // ❌ OLD
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  // ... other state ...

  const handleLogout = () => {
    logout();
    navigate('/login');  // ❌ OLD: useNavigate
  };

  // ... in JSX ...

  // Profile navigation
  <DropdownMenuItem onClick={() => navigate('/profile')}>  {/* ❌ OLD */}
    <User className="h-4 w-4 mr-2" />
    {t.COMMON_TEXT.profile}
  </DropdownMenuItem>

  // Role switcher (desktop)
  <DropdownMenuItem
    onClick={() => { switchRole(role); navigate(path); }}  {/* ❌ OLD */}
  >
    {roleLabelMap[role]}
  </DropdownMenuItem>

  // Role switcher (mobile)
  <button
    onClick={() => { switchRole(role); navigate(path); setMobileOpen(false); }}  {/* ❌ OLD */}
  >
    {roleLabelMap[role]}
  </button>
};
```

### After (Inertia.js)
```typescript
import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';  // ✅ NEW
// ... other imports ...

const Header: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const { url } = usePage();  // ✅ NEW: Available if needed
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  // ... other state ...

  const handleLogout = () => {
    logout();
    router.visit('/login');  // ✅ NEW: Inertia router
  };

  // ... in JSX ...

  // Profile navigation
  <DropdownMenuItem onClick={() => router.visit('/profile')}>  {/* ✅ NEW */}
    <User className="h-4 w-4 mr-2" />
    {t.COMMON_TEXT.profile}
  </DropdownMenuItem>

  // Role switcher (desktop)
  <DropdownMenuItem
    onClick={() => { switchRole(role); router.visit(path); }}  {/* ✅ NEW */}
  >
    {roleLabelMap[role]}
  </DropdownMenuItem>

  // Role switcher (mobile)
  <button
    onClick={() => { switchRole(role); router.visit(path); setMobileOpen(false); }}  {/* ✅ NEW */}
  >
    {roleLabelMap[role]}
  </button>
};
```

---

## 4. NavLink.tsx (Complete Rewrite)

### Before (React Router Wrapper)
```typescript
import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";  // ❌ OLD
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}  {/* ❌ OLD: React Router prop */}
        className={({ isActive, isPending }) =>  {/* ❌ OLD: Callback function */}
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
```

### After (Inertia.js Wrapper)
```typescript
import { Link, usePage } from '@inertiajs/react';  // ✅ NEW
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;  // ✅ NEW: Inertia prop name
  className?: string | ((state: { isActive: boolean }) => string);  // ✅ NEW: Flexible typing
  activeClassName?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, children, ...props }, ref) => {
    const { url } = usePage();  // ✅ NEW: Inertia hook
    const isActive = url === href;  // ✅ NEW: Manual active detection
    
    const resolvedClassName = typeof className === 'function'  // ✅ NEW: Support function-based className
      ? className({ isActive })
      : cn(className, isActive && activeClassName);

    return (
      <Link  {/* ✅ NEW: Inertia Link */}
        ref={ref}
        href={href}  {/* ✅ NEW: Inertia prop */}
        className={resolvedClassName}  {/* ✅ NEW: Direct className */}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

NavLink.displayName = 'NavLink';

export { NavLink };
```

---

## Key Differences Summary

| Aspect | React Router | Inertia.js |
|--------|--------------|-----------|
| **Import Location** | `react-router-dom` | `@inertiajs/react` |
| **Hook for URL** | `useLocation()` returns location object | `usePage()` returns page object with url |
| **Get Current URL** | `location.pathname` | `usePage().url` |
| **Navigation Method** | `navigate('/path')` from `useNavigate()` | `router.visit('/path')` |
| **Link Component** | `<Link to="/path">` | `<Link href="/path">` |
| **Active Detection** | Automatic via `NavLink` callback | Manual with `usePage().url === '/path'` |
| **Active Styling** | `activeClassName` prop | Conditional className via state |
| **Lazy Loading** | N/A | Not applicable |
| **Server Communication** | Client-only | Full-stack integration |

---

## Testing Checklist

- [ ] Sidebar navigation works on desktop
- [ ] Sidebar collapse/expand functionality intact
- [ ] Tooltips display on collapsed sidebar
- [ ] Bottom navigation appears on mobile
- [ ] Bottom navigation icons animate correctly
- [ ] Header dropdowns work (profile, language, role)
- [ ] Logout redirects to login
- [ ] Role switching works and navigates correctly
- [ ] Active menu items are highlighted correctly
- [ ] All icons and styling preserved
- [ ] Responsive behavior maintained
- [ ] No console errors related to routing
