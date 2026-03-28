import React, { useState } from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Building2, Phone } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import feeyanguLogo from '@/assets/feeyangu-logo.png';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['parent', 'school_admin']),
  schoolName: z.string().optional(),
  agreeTerms: z.boolean().refine(v => v, 'You must agree to the terms'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine(d => d.role !== 'school_admin' || (d.schoolName && d.schoolName.length >= 2), {
  message: 'School name is required',
  path: ['schoolName'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const T = useT();
  const t = T.AUTH_TEXT.register;
  const [showPassword, setShowPassword] = useState(false);
  const { processing } = usePage().props;

  const { register: reg, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'parent', agreeTerms: false },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: RegisterForm) => {
    router.post('/register', data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'hsl(39, 33%, 92%)', fontFamily: "'Geist', system-ui, sans-serif" }}>
      <Head title="Register" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={feeyanguLogo} alt="Feeyangu" className="h-8 w-8" />
            <h2 className="text-2xl font-bold" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>
              {T.APP_NAME}
            </h2>
          </div>
        </div>

        <div className="rounded-2xl p-8 shadow-lg border" style={{ backgroundColor: 'hsl(39, 25%, 90%)', borderColor: 'hsl(39, 15%, 82%)' }}>
          <div className="text-center mb-6">
            <h1 className="text-3xl mb-2" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>{t.title}</h1>
            <p className="text-sm" style={{ color: 'hsl(180, 10%, 45%)' }}>{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label style={{ color: 'hsl(180, 18%, 17%)' }}>{t.roleLabel}</Label>
              <RadioGroup defaultValue="parent" onValueChange={v => setValue('role', v as 'parent' | 'school_admin')} className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 rounded-xl p-3 cursor-pointer border transition-all" style={{ backgroundColor: selectedRole === 'parent' ? 'hsl(8, 72%, 55% / 0.1)' : 'hsl(39, 20%, 88%)', borderColor: selectedRole === 'parent' ? 'hsl(8, 72%, 55%)' : 'transparent' }}>
                  <RadioGroupItem value="parent" />
                  <span className="text-sm font-medium" style={{ color: 'hsl(180, 18%, 17%)' }}>{t.roleParent}</span>
                </label>
                <label className="flex items-center gap-2 rounded-xl p-3 cursor-pointer border transition-all" style={{ backgroundColor: selectedRole === 'school_admin' ? 'hsl(8, 72%, 55% / 0.1)' : 'hsl(39, 20%, 88%)', borderColor: selectedRole === 'school_admin' ? 'hsl(8, 72%, 55%)' : 'transparent' }}>
                  <RadioGroupItem value="school_admin" />
                  <span className="text-sm font-medium" style={{ color: 'hsl(180, 18%, 17%)' }}>{t.roleSchoolAdmin}</span>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label style={{ color: 'hsl(180, 18%, 17%)' }}>{t.nameLabel}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                <Input {...reg('name')} className="h-11 pl-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
              </div>
              {errors.name && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.name.message}</p>}
            </div>

            {selectedRole === 'school_admin' && (
              <div className="space-y-2">
                <Label style={{ color: 'hsl(180, 18%, 17%)' }}>{t.schoolNameLabel}</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                  <Input {...reg('schoolName')} className="h-11 pl-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
                </div>
                {errors.schoolName && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.schoolName.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label style={{ color: 'hsl(180, 18%, 17%)' }}>{t.emailLabel}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                <Input {...reg('email')} className="h-11 pl-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
              </div>
              {errors.email && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label style={{ color: 'hsl(180, 18%, 17%)' }}>Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                <Input {...reg('phone')} className="h-11 pl-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
              </div>
              {errors.phone && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label style={{ color: 'hsl(180, 18%, 17%)' }}>{t.passwordLabel}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                  <Input type={showPassword ? 'text' : 'password'} {...reg('password')} className="h-11 pl-10 pr-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(180, 10%, 45%)' }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label style={{ color: 'hsl(180, 18%, 17%)' }}>{t.confirmPasswordLabel}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                  <Input type="password" {...reg('confirmPassword')} className="h-11 pl-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
                </div>
                {errors.confirmPassword && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" onCheckedChange={v => setValue('agreeTerms', !!v)} className="mt-1" />
              <label htmlFor="terms" className="text-sm" style={{ color: 'hsl(180, 10%, 45%)' }}>
                {t.termsText}{' '}
                <Link href="/terms" className="font-semibold hover:underline" style={{ color: 'hsl(8, 72%, 55%)' }}>{t.termsLink}</Link>
              </label>
            </div>
            {errors.agreeTerms && <p className="text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{errors.agreeTerms.message}</p>}

            <Button type="submit" disabled={processing} className="w-full h-11 rounded-xl text-white font-semibold" style={{ backgroundColor: 'hsl(8, 72%, 55%)' }}>
              {processing ? '...' : t.submitButton}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'hsl(180, 10%, 45%)' }}>
            {t.hasAccount}{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'hsl(8, 72%, 55%)' }}>{t.loginLink}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
