import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types/inertia';

/**
 * Returns the current authenticated user's school (tenant) information.
 */
export function useTenant() {
  const { auth } = usePage<PageProps>().props;
  const school = auth.user?.school ?? null;

  return {
    school,
    schoolId: school?.id ?? null,
    schoolName: school?.name ?? null,
    hasTenant: school !== null,
  };
}
