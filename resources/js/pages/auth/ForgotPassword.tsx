import React, { useState } from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
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
    <div className="animate-fade-in">
      <Head title="Forgot Password" />
      
      <div className="flex items-center gap-3 mb-10">
        <img src={feeyanguLogo} alt="Feeyangu" className="h-10 w-10 rounded-xl object-contain" />
        <span className="font-bold text-xl tracking-tight">{T.APP_NAME}</span>
      </div>

      {sent ? (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm mb-6">{t.successMessage}</p>
          <Link href="/login">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t.backToLogin}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-6 lg:justify-start">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">{t.title}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fp-email">{t.emailLabel}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fp-email" type="email" placeholder={t.emailPlaceholder} {...register('email')} className="h-11 pl-10" />
              </div>
              {errors.email && <p className="text-xs text-destructive">{String(errors.email.message)}</p>}
            </div>

            <Button type="submit" className="w-full h-11 font-semibold text-base rounded-lg" disabled={processing}>
              {processing ? '...' : t.submitButton}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.backToLogin}
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
