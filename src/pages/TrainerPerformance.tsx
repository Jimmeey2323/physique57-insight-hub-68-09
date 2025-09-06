
import React, { useEffect } from 'react';
import { SectionLayout } from '@/components/layout/SectionLayout';
import { EnhancedTrainerPerformanceSection } from '@/components/dashboard/EnhancedTrainerPerformanceSection';
import { ProfessionalLoader } from '@/components/dashboard/ProfessionalLoader';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, UserCheck } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';

const TrainerPerformance = () => {
  const { data: payrollData, isLoading } = usePayrollData();
  const { isLoading: globalLoading, setLoading } = useGlobalLoading();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(isLoading, 'Analyzing trainer performance metrics and insights...');
  }, [isLoading, setLoading]);

  if (globalLoading) {
    return <ProfessionalLoader variant="analytics" subtitle="Analyzing trainer performance metrics and insights..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent h-full w-full"></div>
          </div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-16">
          {/* Dashboard Button - Top Left */}
          <div className="absolute top-6 left-6">
            <Button onClick={() => navigate('/')} variant="outline" size="sm" className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 hover:scale-105">
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </div>

          <div className="text-center space-y-6 pt-8">
            <div className="flex justify-center items-center gap-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 animate-fade-in-up hover:bg-white/20 transition-all duration-300">
                <UserCheck className="w-5 h-5 text-blue-300 animate-pulse" />
                <span className="font-medium text-gray-50 uppercase tracking-wider">Trainer Analytics</span>
              </div>
              <AdvancedExportButton 
                payrollData={payrollData}
                defaultFileName="trainer-performance-export"
                size="default"
                variant="outline"
              />
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent animate-fade-in-up delay-200 md:text-7xl leading-tight">
              Trainer Performance & Analytics
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
              Comprehensive instructor productivity analysis and engagement metrics across all studio locations
            </p>

            <div className="flex justify-center gap-4 animate-fade-in-up delay-500">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs text-blue-200">Real-time Tracking</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <div className="text-2xl font-bold text-white">360°</div>
                <div className="text-xs text-blue-200">Performance View</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <div className="text-2xl font-bold text-white">AI</div>
                <div className="text-xs text-blue-200">Powered Insights</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <EnhancedTrainerPerformanceSection />
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

export default TrainerPerformance;
