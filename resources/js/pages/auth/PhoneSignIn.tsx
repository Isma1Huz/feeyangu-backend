import React, { useState, useRef } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import feeyanguLogo from '@/assets/feeyangu-logo.png';

const PhoneSignIn: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const { processing } = usePage().props;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    router.post('/send-phone-code', { phone }, {
      onSuccess: () => setStep('code'),
    });
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/verify-phone-code', { phone, code: code.join('') });
  };

  return (
    <div className="animate-fade-in">
      <Head title="Sign In with Phone" />
      
      <div className="flex items-center gap-3 mb-10">
        <img src={feeyanguLogo} alt="Feeyangu" className="h-10 w-10 rounded-xl object-contain" />
        <span className="font-bold text-xl tracking-tight">Feeyangu</span>
      </div>

      <div className="flex justify-center mb-6 lg:justify-start">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Phone className="h-8 w-8 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">
        {step === 'phone' ? 'Sign in with phone' : 'Enter verification code'}
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        {step === 'phone'
          ? 'We\'ll send a verification code to your phone number.'
          : `Code sent to ${phone}`}
      </p>

      {step === 'phone' ? (
        <form onSubmit={handleSendCode} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+254 700 000 000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="h-11 pl-10"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 font-semibold text-base rounded-lg" disabled={processing || phone.length < 10}>
            {processing ? 'Sending...' : 'Send code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {code.map((digit, i) => (
              <Input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleCodeChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="h-12 w-10 sm:h-14 sm:w-12 text-center text-xl font-bold rounded-lg"
              />
            ))}
          </div>

          <Button type="submit" className="w-full h-11 font-semibold text-base rounded-lg" disabled={processing}>
            {processing ? 'Verifying...' : 'Verify & Sign in'}
          </Button>

          <button type="button" onClick={() => setStep('phone')} className="text-sm text-primary hover:underline w-full text-center">
            Change phone number
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to email sign in
        </Link>
      </div>
    </div>
  );
};

export default PhoneSignIn;
