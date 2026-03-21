export interface SidebarNavItem {
  name: string;
  url: string;
  icon?: string;
}

export interface SidebarCategory {
  name: string;
  icon?: string;
  items: SidebarNavItem[];
}

export interface ModuleSidebarConfig {
  moduleKey: string;
  title: string;
  categories: SidebarCategory[];
}

export const academicsSidebarConfig: ModuleSidebarConfig = {
  moduleKey: 'academics',
  title: 'ACADEMICS',
  categories: [
    {
      name: 'CURRICULUM',
      icon: 'BookOpen',
      items: [
        { name: 'Overview', url: '/school/academics', icon: 'GraduationCap' },
        { name: 'Curricula', url: '/school/academics/curricula', icon: 'Layers' },
        { name: 'Subjects', url: '/school/academics/subjects', icon: 'BookOpen' },
        { name: 'Grade Scales', url: '/school/academics/grade-scales', icon: 'Scale' },
        { name: 'Academic Classes', url: '/school/academics/academic-classes', icon: 'Users' },
      ],
    },
    {
      name: 'ACADEMIC OPERATIONS',
      icon: 'ClipboardList',
      items: [
        { name: 'Exams', url: '/school/academics/exams', icon: 'FileText' },
        { name: 'Marks Entry', url: '/school/academics/exams', icon: 'ClipboardList' },
        { name: 'Timetable', url: '/school/academics/timetable', icon: 'CalendarDays' },
        { name: 'Lesson Plans', url: '/school/academics/lesson-plans', icon: 'BookOpen' },
      ],
    },
    {
      name: 'GRADES & STUDENTS',
      icon: 'Users',
      items: [
        { name: 'Grades & Classes', url: '/school/grades', icon: 'GraduationCap' },
        { name: 'Students', url: '/school/students', icon: 'Users' },
        { name: 'Terms', url: '/school/terms', icon: 'Calendar' },
      ],
    },
  ],
};
