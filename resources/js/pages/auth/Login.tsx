import React, { useState } from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import feeyanguLogo from '@/assets/feeyangu-logo.png';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const T = useT();
  const t = T.AUTH_TEXT.login;
  const [showPassword, setShowPassword] = useState(false);
  const { processing, errors: serverErrors } = usePage().props;

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'sarah@greenacademy.co.ke', password: 'password123' },
  });

  const onSubmit = (data: LoginForm) => {
    router.post('/login', data);
  };

  return (
    <div className="animate-fade-in">
      <Head title="Login" />
      
      <div className="flex items-center gap-3 mb-10">
        <img src={feeyanguLogo} alt="Feeyangu" className="h-10 w-10 rounded-xl object-contain" />
        <span className="font-bold text-xl tracking-tight">{T.APP_NAME}</span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">{t.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">{t.emailLabel}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder={t.emailPlaceholder} {...register('email')} className="h-11 pl-10" />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.passwordLabel}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder={t.passwordPlaceholder} {...register('password')} className="h-11 pl-10 pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">{t.rememberMe}</Label>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 font-semibold text-base rounded-lg" disabled={processing}>
          {processing ? '...' : t.submitButton}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-sm text-center">
        <p className="text-muted-foreground">
          {t.noAccount}{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">{t.registerLink}</Link>
        </p>
        <Link href="/forgot-password" className="text-primary font-medium hover:underline block">{t.forgotPassword}</Link>
      </div>

      <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          <strong>Demo:</strong> Use pre-filled credentials or try{' '}
          <code className="text-primary">admin@feeyangu.com</code> (Super Admin) or{' '}
          <code className="text-primary">david.ochieng@gmail.com</code> (Parent)
        </p>
      </div>
    </div>
  );
};

export default Login;
