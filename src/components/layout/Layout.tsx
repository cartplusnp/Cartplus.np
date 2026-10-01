import React, { ReactNode } from 'react';
import { Header } from '../common/Header';
import { MobileHeader } from '../common/MobileHeader';
import { MobileBottomNav } from '../common/MobileBottomNav';
import { Footer } from '../common/Footer';

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans antialiased">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileHeader />
      </div>

      {/* Primary Viewport Content */}
      <main className="flex-1 w-full pb-18 md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Floating Bottom Bar */}
      <MobileBottomNav />
    </div>
  );
};
