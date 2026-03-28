import React, { useState } from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, KeyRound, MailCheck } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import feeyanguLogo from '@/assets/feeyangu-logo.png';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

const ForgotPassword: React.FC = () => {
  const T = useT();
  const t = T.AUTH_TEXT.forgotPassword;
  const [sent, setSent] = useState(false);
  const { processing } = usePage().props;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: any) => {
    router.post('/forgot-password', data, {
      onSuccess: () => setSent(true),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'hsl(39, 33%, 92%)', fontFamily: "'Geist', system-ui, sans-serif" }}>
      <Head title="Forgot Password" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <img src={feeyanguLogo} alt="Feeyangu" className="h-8 w-8" />
            <h2 className="text-2xl font-bold" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>{T.APP_NAME}</h2>
          </div>
        </div>

        <div className="rounded-2xl p-8 shadow-lg border" style={{ backgroundColor: 'hsl(39, 25%, 90%)', borderColor: 'hsl(39, 15%, 82%)' }}>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: 'hsl(8, 72%, 55% / 0.1)' }}>
                <MailCheck className="w-8 h-8" style={{ color: 'hsl(8, 72%, 55%)' }} />
              </div>
              <h1 className="text-3xl" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>Check your email</h1>
              <p className="text-sm" style={{ color: 'hsl(180, 10%, 45%)' }}>{t.successMessage}</p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: 'hsl(8, 72%, 55%)' }}>
                <ArrowLeft className="w-4 h-4" />
                {t.backToLogin}
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: 'hsl(8, 72%, 55% / 0.1)' }}>
                  <KeyRound className="w-8 h-8" style={{ color: 'hsl(8, 72%, 55%)' }} />
                </div>
                <h1 className="text-3xl mb-2" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>{t.title}</h1>
                <p className="text-sm" style={{ color: 'hsl(180, 10%, 45%)' }}>{t.subtitle}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label style={{ color: 'hsl(180, 18%, 17%)' }}>{t.emailLabel}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                    <Input {...register('email')} className="h-11 pl-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
                  </div>
                  {errors.email && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{String(errors.email.message)}</p>}
                </div>
                <Button type="submit" disabled={processing} className="w-full h-11 rounded-xl text-white font-semibold" style={{ backgroundColor: 'hsl(8, 72%, 55%)' }}>
                  {processing ? '...' : t.submitButton}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: 'hsl(8, 72%, 55%)' }}>
                  <ArrowLeft className="w-4 h-4" />
                  {t.backToLogin}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
