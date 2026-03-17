import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types/inertia';
import type { User } from '@/types';

/**
 * Returns helpers for checking Spatie role/permission data
 * that is shared via Inertia props on the auth.user object.
 */
export function usePermissions() {
  const { auth } = usePage<PageProps>().props;
  const user = auth.user as (User & { permissions?: string[] }) | null;

  const role = user?.role ?? null;
  const roles: string[] = role ? [role] : [];
  const permissions: string[] = user?.permissions ?? [];

  const hasRole = (roleName: string | string[]): boolean => {
    if (Array.isArray(roleName)) {
      return roleName.some((r) => roles.includes(r));
    }
    return roles.includes(roleName);
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const isSuperAdmin = (): boolean => hasRole('super_admin');

  const isSchoolAdmin = (): boolean => hasRole('school_admin');

  return { role, roles, permissions, hasRole, hasPermission, isSuperAdmin, isSchoolAdmin };
}
