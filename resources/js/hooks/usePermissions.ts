import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types/inertia';

/**
 * Returns helpers for checking Spatie role/permission data
 * that is shared via Inertia props.
 *
 * Note: The full permission list is provided by AppServiceProvider and
 * shared on the `auth.user` object. This hook provides convenient accessors.
 */
export function usePermissions() {
  const { auth } = usePage<PageProps>().props;
  const user = auth.user;

  // The role is a single string (first role assigned)
  const role = (user as any)?.role ?? null;
  const roles: string[] = role ? [role] : [];
  const permissions: string[] = (user as any)?.permissions ?? [];

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
