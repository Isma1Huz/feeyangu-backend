import React, { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { PrimarySidebar } from '@/components/Layout/PrimarySidebar';
import { SecondarySidebar } from '@/components/Layout/SecondarySidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import OnboardingTour from '@/components/OnboardingTour';
import FlashMessages from '@/components/FlashMessages';
import { AuthProvider } from '@/contexts/AuthContext';
import { academicsSidebarConfig } from '@/modules/Academics/academicsSidebar';
import { financeSidebarConfig } from '@/modules/Finance/financeSidebar';
import type { ModuleSidebarConfig } from '@/modules/Academics/academicsSidebar';

interface Props {
  children: React.ReactNode;
}

/** Maps a URL prefix to the secondary sidebar config for that module. */
const moduleSidebarConfigs: Array<{
  urlPrefixes: string[];
  config: ModuleSidebarConfig;
}> = [
  { urlPrefixes: ['/school/academics'], config: academicsSidebarConfig },
  {
    urlPrefixes: [
      '/school/fee-structures',
      '/school/payment-methods',
      '/school/payments',
      '/school/receipts',
    ],
    config: financeSidebarConfig,
  },
];

/** Check if the given URL matches any of the provided prefixes. */
function matchesAnyPrefix(url: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => url === prefix || url.startsWith(prefix + '/'),
  );
}

const AppLayout: React.FC<Props> = ({ children }) => {
  const { auth } = usePage().props as {
    auth: { user: { role: string } | null };
  };
  const currentUrl = usePage().url;
  const role = auth?.user?.role ?? null;
  const isSchoolAdmin = role === 'school_admin';

  /** Resolve which secondary sidebar (if any) to show based on current URL. */
  const activeSecondaryConfig = useMemo<ModuleSidebarConfig | null>(() => {
    if (!isSchoolAdmin) return null;
    const match = moduleSidebarConfigs.find(({ urlPrefixes }) =>
      matchesAnyPrefix(currentUrl, urlPrefixes),
    );
    return match?.config ?? null;
  }, [isSchoolAdmin, currentUrl]);

  if (isSchoolAdmin) {
    return (
      <AuthProvider>
        {/* SidebarProvider is kept so that any component using useSidebar() (e.g. Header's SidebarTrigger) doesn't throw */}
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            {/* Primary sidebar — always visible for school admin */}
            <PrimarySidebar />

            {/* Secondary sidebar — only shown when on a module page */}
            {activeSecondaryConfig && (
              <SecondarySidebar config={activeSecondaryConfig} />
            )}

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 p-4 sm:p-6 overflow-auto pb-20 lg:pb-6">
                {children}
              </main>
            </div>
          </div>
          {/* Bottom nav visible only below lg */}
          <BottomNav />
          {/* Onboarding tour */}
          <OnboardingTour />
          {/* Flash messages from Laravel session */}
          <FlashMessages />
        </SidebarProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-4 sm:p-6 overflow-auto pb-20 lg:pb-6">
              {children}
            </main>
          </div>
        </div>
        {/* Bottom nav visible only below lg */}
        <BottomNav />
        {/* Onboarding tour */}
        <OnboardingTour />
        {/* Flash messages from Laravel session */}
        <FlashMessages />
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AppLayout;
