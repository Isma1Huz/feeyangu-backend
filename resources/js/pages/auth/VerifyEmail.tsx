import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { MailCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import feeyanguLogo from '@/assets/feeyangu-logo.png';

const VerifyEmail: React.FC = () => {
  const [resent, setResent] = useState(false);
  const { processing } = usePage().props;

  const handleResend = () => {
    router.post('/resend-verification-email', {}, {
      onSuccess: () => {
        setResent(true);
        setTimeout(() => setResent(false), 3000);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'hsl(39, 33%, 92%)', fontFamily: "'Geist', system-ui, sans-serif" }}>
      <Head title="Verify Email" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <img src={feeyanguLogo} alt="Feeyangu" className="h-8 w-8" />
            <h2 className="text-2xl font-bold" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>Feeyangu</h2>
          </div>
        </div>

        <div className="rounded-2xl p-8 shadow-lg border text-center" style={{ backgroundColor: 'hsl(39, 25%, 90%)', borderColor: 'hsl(39, 15%, 82%)' }}>
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6" style={{ backgroundColor: 'hsl(8, 72%, 55% / 0.1)' }}>
            <MailCheck className="w-10 h-10" style={{ color: 'hsl(8, 72%, 55%)' }} />
          </div>

          <h1 className="text-3xl mb-3" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>Check your email</h1>
          <p className="text-sm mb-8" style={{ color: 'hsl(180, 10%, 45%)' }}>
            We've sent a verification link to your email address. Please click the link to verify your account and continue.
          </p>

          <div className="space-y-3">
            <Button onClick={handleResend} disabled={processing || resent} className="w-full h-11 rounded-xl text-white font-semibold" style={{ backgroundColor: 'hsl(8, 72%, 55%)' }}>
              {resent ? 'Email sent!' : 'Resend verification email'}
            </Button>
            <Button onClick={() => router.visit('/login')} variant="ghost" className="w-full h-11 gap-2 rounded-xl" style={{ color: 'hsl(180, 18%, 17%)' }}>
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
