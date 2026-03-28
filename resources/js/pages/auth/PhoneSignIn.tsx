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
    router.post('/send-phone-code', { phone }, { onSuccess: () => setStep('code') });
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/verify-phone-code', { phone, code: code.join('') });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'hsl(39, 33%, 92%)', fontFamily: "'Geist', system-ui, sans-serif" }}>
      <Head title="Phone Sign In" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <img src={feeyanguLogo} alt="Feeyangu" className="h-8 w-8" />
            <h2 className="text-2xl font-bold" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>Feeyangu</h2>
          </div>
        </div>

        <div className="rounded-2xl p-8 shadow-lg border" style={{ backgroundColor: 'hsl(39, 25%, 90%)', borderColor: 'hsl(39, 15%, 82%)' }}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: 'hsl(8, 72%, 55% / 0.1)' }}>
              <Phone className="w-8 h-8" style={{ color: 'hsl(8, 72%, 55%)' }} />
            </div>
            <h1 className="text-3xl mb-2" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>
              {step === 'phone' ? 'Sign in with phone' : 'Enter verification code'}
            </h1>
            <p className="text-sm" style={{ color: 'hsl(180, 10%, 45%)' }}>
              {step === 'phone' ? "We'll send a verification code to your phone number." : `Code sent to ${phone}`}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="space-y-2">
                <Label style={{ color: 'hsl(180, 18%, 17%)' }}>Phone number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(180, 10%, 45%)' }} />
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 700 000 000" className="h-11 pl-10 rounded-xl border-none" style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)' }} />
                </div>
              </div>
              <Button type="submit" disabled={processing} className="w-full h-11 rounded-xl text-white font-semibold" style={{ backgroundColor: 'hsl(8, 72%, 55%)' }}>
                {processing ? 'Sending...' : 'Send code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="flex justify-center gap-2">
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
                    className="h-14 w-12 text-center text-xl font-bold rounded-xl border-2"
                    style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)', borderColor: digit ? 'hsl(8, 72%, 55%)' : 'hsl(39, 15%, 82%)' }}
                  />
                ))}
              </div>
              <Button type="submit" disabled={processing} className="w-full h-11 rounded-xl text-white font-semibold" style={{ backgroundColor: 'hsl(8, 72%, 55%)' }}>
                {processing ? 'Verifying...' : 'Verify & Sign in'}
              </Button>
              <button type="button" onClick={() => setStep('phone')} className="text-sm hover:underline w-full text-center" style={{ color: 'hsl(8, 72%, 55%)' }}>
                Change phone number
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: 'hsl(8, 72%, 55%)' }}>
              <ArrowLeft className="w-4 h-4" />
              Back to email sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneSignIn;
