import { Link, usePage } from '@inertiajs/react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  className?: string | ((state: { isActive: boolean }) => string);
  activeClassName?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, children, ...props }, ref) => {
    const { url } = usePage();
    const isActive = url === href;
    
    const resolvedClassName = typeof className === 'function'
      ? className({ isActive })
      : cn(className, isActive && activeClassName);

    return (
      <Link
        ref={ref}
        href={href}
        className={resolvedClassName}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

NavLink.displayName = 'NavLink';

export { NavLink };
