import React, { useState } from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, KeyRound } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import feeyanguLogo from '@/assets/feeyangu-logo.png';

interface ResetPasswordProps {
  email?: string;
  token: string;
}

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirmation: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const T = useT();
  const { email, token } = usePage<ResetPasswordProps>().props;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { processing } = usePage().props;

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: email || '' },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    router.post('/reset-password', { ...data, token });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'hsl(39, 33%, 92%)', fontFamily: "'Geist', system-ui, sans-serif" }}>
      <Head title="Reset Password" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <img src={feeyanguLogo} alt="Feeyangu" className="h-8 w-8" />
            <h2 className="text-2xl font-bold" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>{T.APP_NAME}</h2>
          </div>
        </div>

        <div className="rounded-2xl p-8 shadow-lg border" style={{ backgroundColor: 'hsl(39, 25%, 90%)', borderColor: 'hsl(39, 15%, 82%)' }}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: 'hsl(8, 72%, 55% / 0.1)' }}>
              <KeyRound className="w-8 h-8" style={{ color: 'hsl(8, 72%, 55%)' }} />
            </div>
            <h1 className="text-3xl mb-2" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>Reset Password</h1>
            <p className="text-sm" style={{ color: 'hsl(180, 10%, 45%)' }}>Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label style={{ color: 'hsl(180, 18%, 17%)' }}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                <Input {...register('email')} className="h-11 pl-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
              </div>
              {errors.email && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label style={{ color: 'hsl(180, 18%, 17%)' }}>New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                <Input type={showPassword ? 'text' : 'password'} {...register('password')} className="h-11 pl-10 pr-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(180, 10%, 45%)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label style={{ color: 'hsl(180, 18%, 17%)' }}>Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                <Input type={showConfirmPassword ? 'text' : 'password'} {...register('password_confirmation')} className="h-11 pl-10 pr-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(180, 10%, 45%)' }}>
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password_confirmation && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.password_confirmation.message}</p>}
            </div>

            <Button type="submit" disabled={processing} className="w-full h-11 rounded-xl text-white font-semibold" style={{ backgroundColor: 'hsl(8, 72%, 55%)' }}>
              {processing ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: 'hsl(8, 72%, 55%)' }}>Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
