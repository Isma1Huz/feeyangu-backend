import React from 'react';
import { usePage } from '@inertiajs/react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import OnboardingTour from '@/components/OnboardingTour';

interface Props {
  children: React.ReactNode;
}

const AppLayout: React.FC<Props> = ({ children }) => {
  const { auth } = usePage().props as { auth: { user: any } };

  return (
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
    </SidebarProvider>
  );
};

export default AppLayout;
