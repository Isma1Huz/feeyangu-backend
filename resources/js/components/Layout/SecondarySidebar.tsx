import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModuleSidebarConfig, SidebarCategory } from '@/modules/Academics/academicsSidebar';

const getIcon = (iconName?: string): React.ElementType | null => {
  if (!iconName) return null;
  const icons = LucideIcons as Record<string, React.ElementType>;
  return icons[iconName] ?? null;
};

interface CategorySectionProps {
  category: SidebarCategory;
  isExpanded: boolean;
  onToggle: () => void;
  currentUrl: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  isExpanded,
  onToggle,
  currentUrl,
}) => {
  const CategoryIcon = getIcon(category.icon);

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
      >
        <div className="flex items-center gap-2">
          {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5 shrink-0" />}
          <span>{category.name}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-0.5 ml-2 space-y-0.5">
          {category.items.map((item) => {
            const ItemIcon = getIcon(item.icon);
            const isActive =
              currentUrl === item.url ||
              currentUrl.startsWith(item.url + '/');

            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-md transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary pl-[10px]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                {ItemIcon && <ItemIcon className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface SecondarySidebarProps {
  config: ModuleSidebarConfig;
  className?: string;
}

export const SecondarySidebar: React.FC<SecondarySidebarProps> = ({
  config,
  className,
}) => {
  const { url } = usePage();
  const storageKey = `sidebar_expanded_${config.moduleKey}`;

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved) as Record<string, boolean>;
    } catch {
      // ignore parse errors
    }
    // Default: expand all categories
    return config.categories.reduce<Record<string, boolean>>((acc, cat) => {
      acc[cat.name] = true;
      return acc;
    }, {});
  });

  // Persist expanded state
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(expandedCategories));
    } catch {
      // ignore storage errors
    }
  }, [expandedCategories, storageKey]);

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside
      className={cn(
        'w-56 shrink-0 flex flex-col border-r border-sidebar-border bg-background h-screen sticky top-0 z-30',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border shrink-0">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {config.title}
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {config.categories.map((category) => (
          <CategorySection
            key={category.name}
            category={category}
            isExpanded={expandedCategories[category.name] ?? true}
            onToggle={() => toggleCategory(category.name)}
            currentUrl={url}
          />
        ))}
      </nav>
    </aside>
  );
};

export default SecondarySidebar;
