import React, { useEffect, useMemo, useState } from 'react';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useSalesData } from '@/hooks/useSalesData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { EnhancedDiscountsDashboard } from '@/components/dashboard/EnhancedDiscountsDashboard';
import { Button } from '@/components/ui/button';
import { Home, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';

const DiscountsPromotions: React.FC = () => {
  const navigate = useNavigate();
  const { setLoading } = useGlobalLoading();
  const { data: salesData, loading, error } = useSalesData();
  
  // Transform sales data for discount analysis
  const discountData = useMemo(() => {
    if (!salesData) return [];
    
    return salesData.map((item: any) => {
      // Parse numeric values safely
      const parseNumber = (value: any): number => {
        if (value === null || value === undefined || value === '') return 0;
        const cleanValue = value.toString().replace(/[₹,\s]/g, '');
        const num = parseFloat(cleanValue);
        return isNaN(num) ? 0 : num;
      };

      const discountAmount = parseNumber(item.discountAmount || item['Discount Amount -Mrp- Payment Value'] || 0);
      const discountPercentage = parseNumber(item.discountPercentage || item['Discount Percentage - discount amount/mrp*100'] || 0);
      const paymentValue = parseNumber(item.paymentValue || item['Payment Value'] || 0);
      const mrpPreTax = parseNumber(item.mrpPreTax || item['Mrp - Pre Tax'] || 0);
      const mrpPostTax = parseNumber(item.mrpPostTax || item['Mrp - Post Tax'] || 0);

      return {
        ...item,
        memberId: item.memberId || item['Member ID']?.toString() || '',
        customerName: item.customerName || item['Customer Name'] || '',
        customerEmail: item.customerEmail || item['Customer Email'] || '',
        paymentDate: item.paymentDate || item['Payment Date'] || '',
        paymentValue,
        paymentMethod: item.paymentMethod || item['Payment Method'] || '',
        calculatedLocation: item.calculatedLocation || item['Calculated Location'] || '',
        cleanedProduct: item.cleanedProduct || item['Cleaned Product'] || '',
        cleanedCategory: item.cleanedCategory || item['Cleaned Category'] || '',
        soldBy: item.soldBy === '-' ? 'Online/System' : (item.soldBy || item['Sold By'] || 'Unknown'),
        discountAmount,
        discountPercentage,
        mrpPreTax,
        mrpPostTax,
        hasDiscount: discountAmount > 0 || discountPercentage > 0,
      };
    });
  }, [salesData]);

  useEffect(() => {
    setLoading(loading, 'Loading discount and promotional analysis...');
  }, [loading, setLoading]);

  if (loading) {
    return <RefinedLoader subtitle="Loading discount and promotional analysis..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-900 via-red-800 to-red-700 text-white">
          <div className="absolute inset-0 bg-black/20" />
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
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                  <Percent className="w-5 h-5" />
                  <span className="font-medium">Discounts & Promotions</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-red-100 to-red-100 bg-clip-text text-transparent">
                  Connection Error
                </h1>
                
                <p className="text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
                  {error}
                </p>
                
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={() => window.location.reload()}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-6 py-3 rounded-full"
                  >
                    Retry Loading
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-800 via-red-800 to-pink-800">
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="relative z-10 px-8 py-12">
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
              <AdvancedExportButton 
                discountData={discountData}
                defaultFileName="discounts-promotions-export"
                size="default"
                variant="outline"
              />
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20 animate-fade-in-up">
                <Percent className="w-5 h-5" />
                <span className="font-medium">Discounts & Promotions</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-orange-100 to-amber-100 bg-clip-text text-transparent animate-fade-in-up delay-200">
                Discounts & Promotions
              </h1>
              
              <p className="text-xl text-orange-100 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                Comprehensive analysis of discount strategies and promotional impact across all sales channels
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <EnhancedDiscountsDashboard data={discountData} />
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
      `}</style>
    </div>
  );
};

export default DiscountsPromotions;