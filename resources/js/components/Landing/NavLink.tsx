import { forwardRef } from "react";
import { Link } from "@inertiajs/react";

interface NavLinkCompatProps extends Omit<any, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <Link
        ref={ref}        
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
