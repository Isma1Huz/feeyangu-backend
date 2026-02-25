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
    <div className="animate-fade-in text-center">
      <Head title="Verify Email" />
      
      <div className="flex items-center gap-3 mb-10 justify-center lg:justify-start">
        <img src={feeyanguLogo} alt="Feeyangu" className="h-10 w-10 rounded-xl object-contain" />
        <span className="font-bold text-xl tracking-tight">Feeyangu</span>
      </div>

      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <MailCheck className="h-10 w-10 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">Check your email</h2>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
        We've sent a verification link to your email address. Please click the link to verify your account and continue.
      </p>

      <div className="space-y-3">
        <Button onClick={handleResend} variant="outline" className="w-full h-11" disabled={resent || processing}>
          {resent ? 'Email sent!' : 'Resend verification email'}
        </Button>

        <Button onClick={() => router.visit('/login')} variant="ghost" className="w-full h-11 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Button>
      </div>
    </div>
  );
};

export default VerifyEmail;
