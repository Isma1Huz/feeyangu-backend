import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: Record<string, TourStep[]> = {
  school_admin: [
    { target: '[data-sidebar="sidebar"]', title: 'Navigation Sidebar', content: 'Use the sidebar to navigate between dashboard, students, grades, fees, and settings.', position: 'right' },
    { target: '[data-sidebar="trigger"]', title: 'Collapse Sidebar', content: 'Click here to collapse or expand the sidebar for more workspace.', position: 'bottom' },
    { target: 'header', title: 'Header Bar', content: 'Access notifications, switch roles, change language, and manage your profile from the header.', position: 'bottom' },
    { target: 'main', title: 'Main Content Area', content: 'This is your workspace. You\'ll see dashboards, tables, and forms here based on your current page.', position: 'top' },
  ],
  parent: [
    { target: '[data-sidebar="sidebar"]', title: 'Navigation Menu', content: 'Navigate between your dashboard, children, payments, and receipts.', position: 'right' },
    { target: 'header', title: 'Quick Actions', content: 'View notifications and access your profile settings from the header.', position: 'bottom' },
    { target: 'main', title: 'Dashboard', content: 'View your children\'s fee status, make payments, and track your payment history here.', position: 'top' },
  ],
  super_admin: [
    { target: '[data-sidebar="sidebar"]', title: 'Admin Navigation', content: 'Manage schools, users, and platform settings from the sidebar.', position: 'right' },
    { target: 'header', title: 'Platform Overview', content: 'Monitor notifications and access system-wide settings from the header.', position: 'bottom' },
    { target: 'main', title: 'Admin Dashboard', content: 'View platform analytics, manage school registrations, and monitor system health.', position: 'top' },
  ],
};

const TOUR_STORAGE_KEY = 'feeyangu_tour_completed';

const OnboardingTour: React.FC = () => {
  const { auth } = usePage().props as { auth: { user: { role: string } } };
  const user = auth?.user;
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const steps = user?.role ? TOUR_STEPS[user.role] || [] : [];

  useEffect(() => {
    if (!user?.role) return;
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    const completedRoles: string[] = completed ? JSON.parse(completed) : [];
    if (!completedRoles.includes(user.role)) {
      // Delay tour start to let layout render
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user?.role]);

  const updatePosition = useCallback(() => {
    if (!visible || !steps[currentStep]) return;
    const step = steps[currentStep];
    const el = document.querySelector(step.target);
    if (!el) {
      // Fallback: center of screen
      setPosition({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 150 });
      return;
    }
    const rect = el.getBoundingClientRect();
    let top = 0, left = 0;
    const tooltipW = 320, tooltipH = 160;

    switch (step.position) {
      case 'right':
        top = rect.top + rect.height / 2 - tooltipH / 2;
        left = rect.right + 12;
        break;
      case 'bottom':
        top = rect.bottom + 12;
        left = rect.left + rect.width / 2 - tooltipW / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipH / 2;
        left = rect.left - tooltipW - 12;
        break;
      case 'top':
        top = rect.top - tooltipH - 12;
        left = rect.left + rect.width / 2 - tooltipW / 2;
        break;
    }

    // Clamp to viewport
    top = Math.max(8, Math.min(top, window.innerHeight - tooltipH - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipW - 8));
    setPosition({ top, left });
  }, [visible, currentStep, steps]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [updatePosition]);

  const completeTour = () => {
    setVisible(false);
    if (user?.role) {
      const completed = localStorage.getItem(TOUR_STORAGE_KEY);
      const completedRoles: string[] = completed ? JSON.parse(completed) : [];
      if (!completedRoles.includes(user.role)) {
        completedRoles.push(user.role);
        localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(completedRoles));
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={completeTour} />

      {/* Tooltip */}
      <div
        className={cn(
          'fixed z-[101] w-[300px] sm:w-[320px] bg-card text-card-foreground rounded-xl shadow-2xl border border-border p-4 animate-fade-in'
        )}
        style={{ top: position.top, left: position.left }}
      >
        <button onClick={completeTour} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-bold text-sm mb-1">{step.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{step.content}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button size="sm" variant="ghost" onClick={handlePrev} className="h-8 text-xs">
                Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="h-8 text-xs px-4">
              {currentStep === steps.length - 1 ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
