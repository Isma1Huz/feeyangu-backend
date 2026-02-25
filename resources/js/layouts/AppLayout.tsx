import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import OnboardingTour from '@/components/OnboardingTour';
import { useAuth } from '@/contexts/AuthContext';

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 sm:p-6 overflow-auto pb-20 lg:pb-6">
            <Outlet />
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
