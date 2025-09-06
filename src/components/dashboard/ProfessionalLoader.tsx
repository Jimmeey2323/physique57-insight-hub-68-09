import React from 'react';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';

interface ProfessionalLoaderProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'analytics' | 'sales' | 'conversion';
}

export const ProfessionalLoader: React.FC<ProfessionalLoaderProps> = ({
  title = "Physique 57 Analytics",
  subtitle = "Loading your dashboard...",
  variant = 'default'
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'analytics': return BarChart3;
      case 'sales': return TrendingUp;
      case 'conversion': return Zap;
      default: return Activity;
    }
  };

  const getGradient = () => {
    switch (variant) {
      case 'analytics': return 'from-blue-600 to-indigo-600';
      case 'sales': return 'from-green-600 to-emerald-600';
      case 'conversion': return 'from-purple-600 to-pink-600';
      default: return 'from-blue-600 to-purple-600';
    }
  };

  const Icon = getIcon();
  const gradient = getGradient();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 text-center">
        {/* Logo Container */}
        <div className="relative">
          <div className={`w-28 h-28 bg-gradient-to-br ${gradient} rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 transform hover:scale-105 transition-transform duration-300`}>
            <Icon className="w-14 h-14 text-white animate-pulse" style={{ animationDuration: '2s' }} />
          </div>
          
          {/* Floating Elements */}
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
        </div>

        {/* Text Content */}
        <div className="space-y-3 max-w-md">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-80 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div className={`h-full bg-gradient-to-r ${gradient} rounded-full animate-pulse shadow-sm`} style={{ 
            width: '60%',
            animation: 'loading-progress 2s ease-in-out infinite'
          }}></div>
        </div>

        {/* Status Text */}
        <div className="text-sm text-slate-500 flex items-center space-x-2 animate-pulse">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          <span>Processing analytics data...</span>
        </div>
      </div>

      <style>{`
        @keyframes loading-progress {
          0% { width: 10%; }
          50% { width: 70%; }
          100% { width: 10%; }
        }
      `}</style>
    </div>
  );
};