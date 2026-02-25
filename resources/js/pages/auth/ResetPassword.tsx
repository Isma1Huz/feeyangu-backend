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
    router.post('/reset-password', {
      ...data,
      token,
    });
  };

  return (
    <div className="animate-fade-in">
      <Head title="Reset Password" />
      
      <div className="flex items-center gap-3 mb-10">
        <img src={feeyanguLogo} alt="Feeyangu" className="h-10 w-10 rounded-xl object-contain" />
        <span className="font-bold text-xl tracking-tight">{T.APP_NAME}</span>
      </div>

      <div className="flex justify-center mb-6 lg:justify-start">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
        <p className="text-muted-foreground text-sm mt-1">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="email" 
              type="email" 
              placeholder="your@email.com" 
              {...register('email')} 
              className="h-11 pl-10" 
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter new password" 
              {...register('password')} 
              className="h-11 pl-10 pr-10" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="password_confirmation" 
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="Confirm new password" 
              {...register('password_confirmation')} 
              className="h-11 pl-10 pr-10" 
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password_confirmation && <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>}
        </div>

        <Button type="submit" className="w-full h-11 font-semibold text-base rounded-lg" disabled={processing}>
          {processing ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-primary font-medium hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
