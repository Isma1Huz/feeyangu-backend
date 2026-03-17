import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface NavItem {
  name: string;
  route: string;
  icon?: string;
  module?: string | null;
  permission?: string | null;
}

interface NavCategory {
  name: string;
  icon?: string;
  items: NavItem[];
}

interface Navigation {
  categories: NavCategory[];
  bottom_items: NavItem[];
}

const getIcon = (iconName?: string): React.ElementType | null => {
  if (!iconName) return null;
  const icons = LucideIcons as Record<string, React.ElementType>;
  return icons[iconName] ?? null;
};

const NavItemLink: React.FC<{ item: NavItem; isActive?: boolean }> = ({ item, isActive }) => {
  const Icon = getIcon(item.icon);

  return (
    <Link
      href={`/${item.route.split('.').join('/')}`}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="truncate">{item.name}</span>
    </Link>
  );
};

const NavCategorySection: React.FC<{ category: NavCategory; currentPath: string }> = ({ category, currentPath }) => {
  const isAnyActive = category.items.some((item) =>
    currentPath.includes(item.route.replace('.', '/'))
  );
  const [expanded, setExpanded] = useState(isAnyActive);
  const CategoryIcon = getIcon(category.icon);

  return (
    <div>
      <button
        className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
          {category.name}
        </div>
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {expanded && (
        <div className="space-y-0.5 mt-1">
          {category.items.map((item) => (
            <NavItemLink
              key={item.route}
              item={item}
              isActive={currentPath.includes(item.route.replace('.', '/'))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface DynamicSidebarProps {
  className?: string;
}

const DynamicSidebar: React.FC<DynamicSidebarProps> = ({ className }) => {
  const [navigation, setNavigation] = useState<Navigation | null>(null);
  const [loading, setLoading] = useState(true);
  const { url } = usePage();

  useEffect(() => {
    axios
      .get('/api/navigation')
      .then((res) => setNavigation(res.data.navigation))
      .catch(() => setNavigation(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <aside className={cn('w-64 shrink-0', className)}>
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </aside>
    );
  }

  if (!navigation) return null;

  return (
    <aside className={cn('w-64 shrink-0 flex flex-col', className)}>
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {navigation.categories.map((category) => (
          <NavCategorySection
            key={category.name}
            category={category}
            currentPath={url}
          />
        ))}
      </nav>

      {navigation.bottom_items.length > 0 && (
        <div className="border-t p-3 space-y-0.5">
          {navigation.bottom_items.map((item) => (
            <NavItemLink key={item.route} item={item} isActive={url.includes(item.route.replace('.', '/'))} />
          ))}
        </div>
      )}
    </aside>
  );
};

export default DynamicSidebar;
