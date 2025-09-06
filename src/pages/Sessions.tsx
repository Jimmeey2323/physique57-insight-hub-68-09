
import React from 'react';
import { SessionsSection } from '@/components/dashboard/SessionsSection';
import { Footer } from '@/components/ui/footer';
import { SessionsFiltersProvider } from '@/contexts/SessionsFiltersContext';

const Sessions = () => {
  return (
    <SessionsFiltersProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
        <main>
          <SessionsSection />
        </main>
        <Footer />
      </div>
    </SessionsFiltersProvider>
  );
};

export default Sessions;
