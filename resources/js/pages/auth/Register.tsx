import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Building2, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register: reg, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'parent', agreeTerms: false },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      // Mock: auto-login after registration then navigate to verify email
      await login(data.email, data.password);
      navigate('/verify-email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <img src={feeyanguLogo} alt="Feeyangu" className="h-10 w-10 rounded-xl object-contain" />
        <span className="font-bold text-xl tracking-tight">{T.APP_NAME}</span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{t.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role selector */}
        <div className="space-y-2">
          <Label>{t.roleLabel}</Label>
          <RadioGroup
            defaultValue="parent"
            onValueChange={(v) => setValue('role', v as 'parent' | 'school_admin')}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="role-parent"
              className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedRole === 'parent' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
            >
              <RadioGroupItem value="parent" id="role-parent" />
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{t.roleParent}</span>
            </Label>
            <Label
              htmlFor="role-school"
              className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedRole === 'school_admin' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
            >
              <RadioGroupItem value="school_admin" id="role-school" />
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">{t.roleSchoolAdmin}</span>
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">{t.nameLabel}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="name" placeholder={t.namePlaceholder} {...reg('name')} className="h-11 pl-10" />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        {selectedRole === 'school_admin' && (
          <div className="space-y-2">
            <Label htmlFor="schoolName">{t.schoolNameLabel}</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="schoolName" placeholder={t.schoolNamePlaceholder} {...reg('schoolName')} className="h-11 pl-10" />
            </div>
            {errors.schoolName && <p className="text-xs text-destructive">{errors.schoolName.message}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reg-email">{t.emailLabel}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="reg-email" type="email" placeholder={t.emailPlaceholder} {...reg('email')} className="h-11 pl-10" />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-phone">Phone number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="reg-phone" type="tel" placeholder="+254 700 000 000" {...reg('phone')} className="h-11 pl-10" />
          </div>
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reg-password">{t.passwordLabel}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder={t.passwordPlaceholder} {...reg('password')} className="h-11 pl-10 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-confirm">{t.confirmPasswordLabel}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="reg-confirm" type="password" placeholder={t.confirmPasswordPlaceholder} {...reg('confirmPassword')} className="h-11 pl-10" />
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            onCheckedChange={(v) => setValue('agreeTerms', !!v)}
          />
          <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-snug">
            {t.termsText}{' '}
            <Link to="/terms" className="text-primary hover:underline font-medium">{t.termsLink}</Link>
          </Label>
        </div>
        {errors.agreeTerms && <p className="text-xs text-destructive">{errors.agreeTerms.message}</p>}

        <Button type="submit" className="w-full h-11 font-semibold text-base rounded-lg" disabled={loading}>
          {loading ? '...' : t.submitButton}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t.hasAccount}{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">{t.loginLink}</Link>
      </p>
    </div>
  );
};

export default Register;
