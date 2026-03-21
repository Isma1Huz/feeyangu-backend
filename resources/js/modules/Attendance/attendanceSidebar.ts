import type { ModuleSidebarConfig } from '../Academics/academicsSidebar';

export const attendanceSidebarConfig: ModuleSidebarConfig = {
  moduleKey: 'attendance',
  title: 'ATTENDANCE',
  categories: [
    {
      name: 'ATTENDANCE',
      icon: 'CalendarCheck',
      items: [
        { name: 'Overview', url: '/school/attendance', icon: 'LayoutDashboard' },
        { name: 'Daily Attendance', url: '/school/attendance/daily', icon: 'CalendarDays' },
        { name: 'Reports', url: '/school/attendance/reports', icon: 'BarChart3' },
      ],
    },
  ],
};
