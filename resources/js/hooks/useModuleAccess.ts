import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types/inertia';
import type { ModuleKey } from '@/types';

/**
 * Returns the list of enabled module keys for the current school,
 * as shared by the Inertia middleware from the backend.
 */
export function useModuleAccess() {
  const { modules = [] } = usePage<PageProps>().props;

  /**
   * Check whether a single module (or ALL of a list) is enabled.
   */
  const isEnabled = (moduleKey: ModuleKey | ModuleKey[]): boolean => {
    if (Array.isArray(moduleKey)) {
      return moduleKey.every((k) => modules.includes(k));
    }
    return modules.includes(moduleKey);
  };

  /**
   * Check whether ANY of a list of modules is enabled.
   */
  const isAnyEnabled = (moduleKeys: ModuleKey[]): boolean => {
    return moduleKeys.some((k) => modules.includes(k));
  };

  return { modules, isEnabled, isAnyEnabled };
}
