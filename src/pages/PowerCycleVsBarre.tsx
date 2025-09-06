
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { ProfessionalLoader } from '@/components/dashboard/ProfessionalLoader';
import { PowerCycleVsBarreSection } from '@/components/dashboard/PowerCycleVsBarreSection';
import { SessionsFiltersProvider } from '@/contexts/SessionsFiltersContext';
import { Button } from '@/components/ui/button';
import { Home, BarChart3 } from 'lucide-react';
import { Footer } from '@/components/ui/footer';

const PowerCycleVsBarre = () => {
  const { data: payrollData, isLoading: loading } = usePayrollData();
  const { isLoading, setLoading } = useGlobalLoading();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading !== undefined) {
      setLoading(loading, 'Loading PowerCycle vs Barre vs Strength performance data...');
    }
  }, [loading, setLoading]);

  if (isLoading) {
    return <ProfessionalLoader variant="analytics" subtitle="Loading PowerCycle vs Barre vs Strength performance data..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Animated Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-10 w-24 h-24 bg-indigo-300/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-10 left-20 w-40 h-40 bg-purple-300/10 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20 animate-fade-in-up">
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Class Format Analysis • PowerCycle • Barre • Strength Lab</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent animate-fade-in-up delay-200">
                PowerCycle vs Barre vs Strength
              </h1>
              
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                Comprehensive analysis of PowerCycle, Barre, and Strength Lab class performance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <SessionsFiltersProvider>
            <PowerCycleVsBarreSection data={payrollData || []} />
          </SessionsFiltersProvider>
        </main>
      </div>
      
      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default PowerCycleVsBarre;
