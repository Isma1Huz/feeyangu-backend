import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface LimitInfo {
  current: number;
  limit: number;   // 0 = unlimited
  remaining: number | null;
}

interface SubscriptionLimits {
  students: LimitInfo;
  staff: LimitInfo;
}

interface UseSubscriptionLimitsReturn {
  limits: SubscriptionLimits | null;
  loading: boolean;
  getRemainingStudents: () => number | null;
  getRemainingStaff: () => number | null;
  isNearLimit: (resourceType: 'students' | 'staff') => boolean;
  isAtLimit: (resourceType: 'students' | 'staff') => boolean;
  canAdd: (resourceType: 'students' | 'staff') => boolean;
  getLimitMessage: (resourceType: 'students' | 'staff') => string;
}

export function useSubscriptionLimits(): UseSubscriptionLimitsReturn {
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/school/subscription/limits')
      .then((res) => setLimits(res.data))
      .catch(() => setLimits(null))
      .finally(() => setLoading(false));
  }, []);

  const getInfo = (type: 'students' | 'staff'): LimitInfo | null => limits?.[type] ?? null;

  const getUsagePercent = (type: 'students' | 'staff'): number => {
    const info = getInfo(type);
    if (!info || info.limit === 0) return 0;
    return Math.round((info.current / info.limit) * 100);
  };

  return {
    limits,
    loading,

    getRemainingStudents: () => getInfo('students')?.remaining ?? null,
    getRemainingStaff:    () => getInfo('staff')?.remaining ?? null,

    isNearLimit: (type) => {
      const info = getInfo(type);
      if (!info || info.limit === 0) return false;
      return getUsagePercent(type) >= 80;
    },

    isAtLimit: (type) => {
      const info = getInfo(type);
      if (!info || info.limit === 0) return false;
      return info.current >= info.limit;
    },

    canAdd: (type) => {
      const info = getInfo(type);
      if (!info || info.limit === 0) return true; // unlimited
      return info.current < info.limit;
    },

    getLimitMessage: (type) => {
      const info = getInfo(type);
      if (!info) return '';
      if (info.limit === 0) return `Unlimited ${type}`;
      if (info.current >= info.limit) {
        return `${type === 'students' ? 'Student' : 'Staff'} limit reached (${info.limit} max). Please upgrade.`;
      }
      const remaining = info.remaining ?? (info.limit - info.current);
      return `${remaining} ${type === 'students' ? 'student' : 'staff'} slot${remaining === 1 ? '' : 's'} remaining`;
    },
  };
}
