import React, { useState, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import feeyanguLogo from '@/assets/feeyangu-logo.png';

const TwoFactorAuth: React.FC = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const { processing } = usePage().props;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    pasted.split('').forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    const nextEmpty = Math.min(pasted.length, 5);
    inputRefs.current[nextEmpty]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    router.post('/verify-2fa', { code: fullCode });
  };

  return (
    <div className="animate-fade-in text-center">
      <Head title="Two-Factor Authentication" />
      
      <div className="flex items-center gap-3 mb-10 justify-center lg:justify-start">
        <img src={feeyanguLogo} alt="Feeyangu" className="h-10 w-10 rounded-xl object-contain" />
        <span className="font-bold text-xl tracking-tight">Feeyangu</span>
      </div>

      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">Two-Factor Authentication</h2>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
        Enter the 6-digit verification code sent to your email or authenticator app.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <Input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="h-12 w-10 sm:h-14 sm:w-12 text-center text-xl font-bold rounded-lg"
            />
          ))}
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button type="submit" className="w-full h-11 font-semibold text-base rounded-lg" disabled={processing}>
          {processing ? 'Verifying...' : 'Verify Code'}
        </Button>

        <div className="space-y-2 text-sm">
          <button type="button" className="text-primary hover:underline font-medium">
            Resend code
          </button>
          <Button onClick={() => router.visit('/login')} variant="ghost" className="w-full h-11 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TwoFactorAuth;
