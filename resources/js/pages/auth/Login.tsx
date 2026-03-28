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
    defaultValues: { email: 'admin@feeyangu.com', password: 'password' },
  });

  const onSubmit = (data: LoginForm) => {
    router.post('/login', data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'hsl(39, 33%, 92%)', fontFamily: "'Geist', system-ui, sans-serif" }}>
      <Head title="Login" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>
            {T.APP_NAME}
          </h2>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-lg border" style={{ backgroundColor: 'hsl(39, 25%, 90%)', borderColor: 'hsl(39, 15%, 82%)' }}>
          <div className="text-center mb-6">
            <h1 className="text-3xl mb-2" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>
              {t.title}
            </h1>
            <p className="text-sm" style={{ color: 'hsl(180, 10%, 45%)' }}>{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label style={{ color: 'hsl(180, 18%, 17%)' }}>{t.emailLabel}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                <Input {...register('email')} className="h-11 pl-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
              </div>
              {errors.email && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label style={{ color: 'hsl(180, 18%, 17%)' }}>{t.passwordLabel}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                <Input type={showPassword ? 'text' : 'password'} {...register('password')} className="h-11 pl-10 pr-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(180, 10%, 45%)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <label htmlFor="remember" className="text-sm" style={{ color: 'hsl(180, 18%, 17%)' }}>{t.rememberMe}</label>
              </div>
            </div>

            <Button type="submit" disabled={processing} className="w-full h-11 rounded-xl text-white font-semibold" style={{ backgroundColor: 'hsl(8, 72%, 55%)' }}>
              {processing ? '...' : t.submitButton}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm">
            <p style={{ color: 'hsl(180, 10%, 45%)' }}>
              {t.noAccount}{' '}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: 'hsl(8, 72%, 55%)' }}>{t.registerLink}</Link>
            </p>
            <Link href="/forgot-password" className="hover:underline" style={{ color: 'hsl(8, 72%, 55%)' }}>{t.forgotPassword}</Link>
          </div>
        </div>

        <div className="mt-4 rounded-xl p-4 text-center" style={{ backgroundColor: 'hsl(39, 20%, 88%)', borderColor: 'hsl(39, 15%, 82%)' }}>
          <p className="text-xs" style={{ color: 'hsl(180, 10%, 45%)' }}>
            Demo: Use pre-filled credentials or try{' '}
            <code style={{ color: 'hsl(8, 72%, 55%)' }}>admin@feeyangu.com</code> (Super Admin) or{' '}
            <code style={{ color: 'hsl(8, 72%, 55%)' }}>david.ochieng@gmail.com</code> (Parent)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
