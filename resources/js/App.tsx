import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import TwoFactorAuth from "@/pages/auth/TwoFactorAuth";
import PhoneSignIn from "@/pages/auth/PhoneSignIn";

// School
import SchoolDashboard from "@/pages/school/Dashboard";
import FeeStructures from "@/pages/school/FeeStructures";
import SchoolGrades from "@/pages/school/Grades";
import SchoolTerms from "@/pages/school/Terms";
import Payments from "@/pages/school/Payments";
import Receipts from "@/pages/school/Receipts";
import SchoolPaymentMethods from "@/pages/school/PaymentMethods";
import SchoolSettings from "@/pages/school/Settings";
import PlatformBilling from "@/pages/school/PlatformBilling";

// Parent
import ParentDashboard from "@/pages/parent/Dashboard";
import ParentChildren from "@/pages/parent/Children";
import StudentFees from "@/pages/parent/StudentFees";
import PaymentHistory from "@/pages/parent/PaymentHistory";
import ParentReceipts from "@/pages/parent/Receipts";

// School - Students
import SchoolStudents from "@/pages/school/Students";
import StudentDetail from "@/pages/school/StudentDetail";

// Accountant
import AccountantDashboard from "@/pages/accountant/Dashboard";
import AccountantFeeStructures from "@/pages/accountant/FeeStructures";
import AccountantInvoicing from "@/pages/accountant/Invoicing";
import AccountantPayments from "@/pages/accountant/Payments";
import AccountantReconciliation from "@/pages/accountant/Reconciliation";
import AccountantReports from "@/pages/accountant/Reports";
import AccountantExpenses from "@/pages/accountant/Expenses";
import AccountantIntegrations from "@/pages/accountant/Integrations";
import AccountantPaymentGateway from "@/pages/accountant/PaymentGateway";

// Admin
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminSchools from "@/pages/admin/Schools";
import AdminUsers from "@/pages/admin/Users";
import AdminSettings from "@/pages/admin/Settings";

import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Auth routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/two-factor" element={<TwoFactorAuth />} />
                  <Route path="/phone-signin" element={<PhoneSignIn />} />
                </Route>

                {/* App routes */}
                <Route element={<AppLayout />}>
                  {/* Admin */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/schools" element={<AdminSchools />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />

                  {/* School */}
                  <Route path="/school/dashboard" element={<SchoolDashboard />} />
                  <Route path="/school/grades" element={<SchoolGrades />} />
                  <Route path="/school/terms" element={<SchoolTerms />} />
                  <Route path="/school/students" element={<SchoolStudents />} />
                  <Route path="/school/students/:id" element={<StudentDetail />} />
                  <Route path="/school/fee-structures" element={<FeeStructures />} />
                  <Route path="/school/payment-methods" element={<SchoolPaymentMethods />} />
                  <Route path="/school/payments" element={<Payments />} />
                  <Route path="/school/receipts" element={<Receipts />} />
                  <Route path="/school/settings" element={<SchoolSettings />} />
                  <Route path="/school/billing" element={<PlatformBilling />} />

                  {/* Parent */}
                  <Route path="/parent/dashboard" element={<ParentDashboard />} />
                  <Route path="/parent/children" element={<ParentChildren />} />
                  <Route path="/parent/children/:studentId/fees" element={<StudentFees />} />
                  <Route path="/parent/payments" element={<PaymentHistory />} />
                  <Route path="/parent/receipts" element={<ParentReceipts />} />

                  {/* Accountant */}
                  <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
                  <Route path="/accountant/fee-structures" element={<AccountantFeeStructures />} />
                  <Route path="/accountant/invoicing" element={<AccountantInvoicing />} />
                  <Route path="/accountant/payments" element={<AccountantPayments />} />
                  <Route path="/accountant/reconciliation" element={<AccountantReconciliation />} />
                  <Route path="/accountant/reports" element={<AccountantReports />} />
                  <Route path="/accountant/expenses" element={<AccountantExpenses />} />
                  <Route path="/accountant/integrations" element={<AccountantIntegrations />} />
                  <Route path="/accountant/payment-gateway" element={<AccountantPaymentGateway />} />

                  {/* Profile */}
                  <Route path="/profile" element={<Profile />} />
                </Route>

                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
