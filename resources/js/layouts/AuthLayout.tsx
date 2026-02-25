import React from 'react';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '@/lib/ui-text';
import authIllustration from '@/assets/auth-illustration.png';

interface Props {
  children: React.ReactNode;
}

const AuthLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right panel - branding (dark) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-foreground relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-black/30" />
        <div className="relative z-10 text-center max-w-md">
          <img
            src={authIllustration}
            alt="School fee management illustration"
            className="w-72 h-auto mx-auto mb-8 opacity-90"
          />
          <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">{APP_NAME}</p>
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to {APP_NAME}</h1>
          <p className="text-sm text-white/70 leading-relaxed mb-8">{APP_DESCRIPTION}</p>

          {/* CTA card like reference */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 text-left">
            <h3 className="text-lg font-bold text-white mb-1">{APP_TAGLINE}</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Join thousands of schools managing fees effortlessly with Feeyangu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
