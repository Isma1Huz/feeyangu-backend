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
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
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
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) { setError('Please enter the full 6-digit code'); return; }
    router.post('/verify-2fa', { code: fullCode });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'hsl(39, 33%, 92%)', fontFamily: "'Geist', system-ui, sans-serif" }}>
      <Head title="Two-Factor Authentication" />

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
              <ShieldCheck className="w-8 h-8" style={{ color: 'hsl(8, 72%, 55%)' }} />
            </div>
            <h1 className="text-3xl mb-2" style={{ color: 'hsl(180, 18%, 17%)', fontFamily: "'Instrument Serif', serif" }}>Two-Factor Authentication</h1>
            <p className="text-sm" style={{ color: 'hsl(180, 10%, 45%)' }}>Enter the 6-digit verification code sent to your email or authenticator app.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
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
                  className="h-14 w-12 text-center text-xl font-bold rounded-xl border-2 focus:ring-2"
                  style={{ backgroundColor: 'hsl(39, 20%, 88%)', color: 'hsl(180, 18%, 17%)', borderColor: digit ? 'hsl(8, 72%, 55%)' : 'hsl(39, 15%, 82%)' }}
                />
              ))}
            </div>

            {error && <p className="text-center text-xs" style={{ color: 'hsl(0, 84%, 60%)' }}>{error}</p>}

            <Button type="submit" disabled={processing} className="w-full h-11 rounded-xl text-white font-semibold" style={{ backgroundColor: 'hsl(8, 72%, 55%)' }}>
              {processing ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="space-y-2">
              <button type="button" className="text-sm hover:underline w-full text-center" style={{ color: 'hsl(8, 72%, 55%)' }}>Resend code</button>
              <Button onClick={() => router.visit('/login')} variant="ghost" className="w-full h-11 gap-2 rounded-xl" style={{ color: 'hsl(180, 18%, 17%)' }}>
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
