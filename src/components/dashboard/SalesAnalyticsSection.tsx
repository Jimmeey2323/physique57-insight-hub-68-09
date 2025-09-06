import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutoCloseFilterSection } from './AutoCloseFilterSection';
import { MetricCard } from './MetricCard';
import { UnifiedTopBottomSellers } from './UnifiedTopBottomSellers';
import { DataTable } from './DataTable';
import { InteractiveChart } from './InteractiveChart';
import { ThemeSelector } from './ThemeSelector';
import { EnhancedSalesDrillDownModal } from './EnhancedSalesDrillDownModal';
import { EnhancedYearOnYearTable } from './EnhancedYearOnYearTable';
import { MonthOnMonthTable } from './MonthOnMonthTable';
import { ProductPerformanceTable } from './ProductPerformanceTable';
import { CategoryPerformanceTable } from './CategoryPerformanceTable';
import { SalesAnimatedMetricCards } from './SalesAnimatedMetricCards';
import { SalesInteractiveCharts } from './SalesInteractiveCharts';
import { SoldByMonthOnMonthTable } from './SoldByMonthOnMonthTable';
import { PaymentMethodMonthOnMonthTable } from './PaymentMethodMonthOnMonthTable';
import { NoteTaker } from '@/components/ui/NoteTaker';
import { SalesData, FilterOptions, MetricCardData, YearOnYearMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';

interface SalesAnalyticsSectionProps {
  data: SalesData[];
}

const locations = [{
  id: 'kwality',
  name: 'Kwality House, Kemps Corner',
  fullName: 'Kwality House, Kemps Corner'
}, {
  id: 'supreme',
  name: 'Supreme HQ, Bandra',
  fullName: 'Supreme HQ, Bandra'
}, {
  id: 'kenkere',
  name: 'Kenkere House',
  fullName: 'Kenkere House'
}];

export const SalesAnalyticsSection: React.FC<SalesAnalyticsSectionProps> = ({ data }) => {
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'product' | 'category' | 'member'>('metric');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeYoyMetric, setActiveYoyMetric] = useState<YearOnYearMetricType>('revenue');

  // Initialize filters with previous month as default
  const [filters, setFilters] = useState<FilterOptions>(() => {
    const previousMonth = getPreviousMonthDateRange();
    
    return {
      dateRange: previousMonth,
      location: [],
      category: [],
      product: [],
      soldBy: [],
      paymentMethod: []
    };
  });

  const applyFilters = (rawData: SalesData[], includeHistoric: boolean = false) => {
    console.log('Applying filters to', rawData.length, 'records. IncludeHistoric:', includeHistoric);
    console.log('Current filters:', filters);
    console.log('Active location:', activeLocation);
    
    let filtered = [...rawData];

    // Apply location filter
    filtered = filtered.filter(item => {
      const locationMatch = activeLocation === 'kwality' 
        ? item.calculatedLocation === 'Kwality House, Kemps Corner' 
        : activeLocation === 'supreme' 
        ? item.calculatedLocation === 'Supreme HQ, Bandra' 
        : item.calculatedLocation?.includes('Kenkere') || item.calculatedLocation === 'Kenkere House';
      return locationMatch;
    });

    console.log('After location filter:', filtered.length, 'records');

    // Apply date range filter
    if (!includeHistoric && (filters.dateRange.start || filters.dateRange.end)) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
      
      console.log('Applying date filter:', startDate, 'to', endDate);
      
      filtered = filtered.filter(item => {
        if (!item.paymentDate) return false;

        let itemDate: Date | null = null;

        // Try DD/MM/YYYY format first
        const ddmmyyyy = item.paymentDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) {
          const [, day, month, year] = ddmmyyyy;
          itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Try other formats
          const formats = [
            new Date(item.paymentDate), 
            new Date(item.paymentDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')), 
            new Date(item.paymentDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'))
          ];
          
          for (const date of formats) {
            if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
              itemDate = date;
              break;
            }
          }
        }

        if (!itemDate || isNaN(itemDate.getTime())) return false;
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
      
      console.log('After date filter:', filtered.length, 'records');
    }

    // Apply category filter
    if (filters.category?.length) {
      filtered = filtered.filter(item => 
        filters.category!.some(cat => 
          item.cleanedCategory?.toLowerCase().includes(cat.toLowerCase())
        )
      );
      console.log('After category filter:', filtered.length, 'records');
    }

    // Apply payment method filter
    if (filters.paymentMethod?.length) {
      filtered = filtered.filter(item => 
        filters.paymentMethod!.some(method => 
          item.paymentMethod?.toLowerCase().includes(method.toLowerCase())
        )
      );
      console.log('After payment method filter:', filtered.length, 'records');
    }

    // Apply sold by filter
    if (filters.soldBy?.length) {
      filtered = filtered.filter(item => 
        filters.soldBy!.some(seller => 
          item.soldBy?.toLowerCase().includes(seller.toLowerCase())
        )
      );
      console.log('After sold by filter:', filtered.length, 'records');
    }

    // Apply amount range filters
    if (filters.minAmount) {
      filtered = filtered.filter(item => (item.paymentValue || 0) >= filters.minAmount!);
      console.log('After min amount filter:', filtered.length, 'records');
    }
    
    if (filters.maxAmount) {
      filtered = filtered.filter(item => (item.paymentValue || 0) <= filters.maxAmount!);
      console.log('After max amount filter:', filtered.length, 'records');
    }

    console.log('Final filtered data:', filtered.length, 'records');
    return filtered;
  };

  const filteredData = useMemo(() => applyFilters(data), [data, filters, activeLocation]);
  const allHistoricData = useMemo(() => applyFilters(data, true), [data, activeLocation]);

  const handleRowClick = (rowData: any) => {
    console.log('Row clicked with data:', rowData);
    // Enhance the drill down data with filtered raw data
    const enhancedData = {
      ...rowData,
      rawData: filteredData.filter(item => {
        if (rowData.soldBy) return item.soldBy === rowData.soldBy;
        if (rowData.paymentMethod) return item.paymentMethod === rowData.paymentMethod;
        if (rowData.name) return item.cleanedProduct === rowData.name || item.cleanedCategory === rowData.name;
        return true;
      })
    };
    setDrillDownData(enhancedData);
    setDrillDownType('product');
  };

  const handleMetricClick = (metricData: any) => {
    console.log('Metric clicked with data:', metricData);
    // Enhance metric data with raw sales data
    const enhancedData = {
      ...metricData,
      rawData: filteredData,
      grossRevenue: filteredData.reduce((sum, item) => sum + (item.paymentValue || 0), 0),
      transactions: filteredData.length,
      uniqueMembers: new Set(filteredData.map(item => item.memberId)).size
    };
    setDrillDownData(enhancedData);
    setDrillDownType('metric');
  };

  const handleGroupToggle = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setCollapsedGroups(newCollapsed);
  };

  const resetFilters = () => {
    const previousMonth = getPreviousMonthDateRange();
    
    setFilters({
      dateRange: previousMonth,
      location: [],
      category: [],
      product: [],
      soldBy: [],
      paymentMethod: []
    });
  };

  return (
    <div className="space-y-8">
      {/* Note Taker Component */}
      <NoteTaker />

      {/* Filter and Location Tabs */}
      <div className="space-y-6">
        <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid grid-cols-3 w-full max-w-7xl min-h-24 overflow-hidden">
              {locations.map(location => (
                <TabsTrigger 
                  key={location.id} 
                  value={location.id} 
                  className="relative px-6 py-4 font-semibold text-gray-800 transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50 text-2xl rounded-2xl"
                >
                  <div className="relative z-10 text-center">
                    <div className="font-bold">{location.name.split(',')[0]}</div>
                    <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {locations.map(location => (
            <TabsContent key={location.id} value={location.id} className="space-y-8">
              <div className="flex justify-between items-center gap-4">
                <AutoCloseFilterSection 
                  filters={filters} 
                  onFiltersChange={setFilters} 
                  onReset={resetFilters} 
                />
                <AdvancedExportButton 
                  salesData={filteredData}
                  defaultFileName={`sales-analytics-${location.name.toLowerCase().replace(/\s+/g, '-')}`}
                  size="default"
                  variant="outline"
                />
              </div>

              <SalesAnimatedMetricCards 
                data={filteredData} 
                onMetricClick={handleMetricClick}
              />

              <SalesInteractiveCharts data={allHistoricData} />

              <UnifiedTopBottomSellers data={filteredData} />

              <Tabs defaultValue="yearOnYear" className="w-full">
                <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid grid-cols-6 w-full max-w-6xl mx-auto overflow-hidden">
                  <TabsTrigger value="yearOnYear" className="relative rounded-xl px-4 py-3 font-semibold text-xs transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50">
                    Year-on-Year
                  </TabsTrigger>
                  <TabsTrigger value="monthOnMonth" className="relative rounded-xl px-4 py-3 font-semibold text-xs transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50">
                    Month-on-Month
                  </TabsTrigger>
                  <TabsTrigger value="productPerformance" className="relative rounded-xl px-4 py-3 font-semibold text-xs transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50">
                    Product Performance
                  </TabsTrigger>
                  <TabsTrigger value="categoryPerformance" className="relative rounded-xl px-4 py-3 font-semibold text-xs transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50">
                    Category Performance
                  </TabsTrigger>
                  <TabsTrigger value="soldByAnalysis" className="relative rounded-xl px-4 py-3 font-semibold text-xs transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50">
                    Sold By Analysis
                  </TabsTrigger>
                  <TabsTrigger value="paymentMethodAnalysis" className="relative rounded-xl px-4 py-3 font-semibold text-xs transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50">
                    Payment Methods
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="yearOnYear" className="mt-8">
                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Year-on-Year Analysis</h2>
                    <EnhancedYearOnYearTable 
                      data={allHistoricData} 
                      onRowClick={handleRowClick} 
                      selectedMetric={activeYoyMetric} 
                    />
                  </section>
                </TabsContent>

                <TabsContent value="monthOnMonth" className="mt-8">
                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Month-on-Month Analysis</h2>
                    <MonthOnMonthTable 
                      data={allHistoricData} 
                      onRowClick={handleRowClick} 
                      collapsedGroups={collapsedGroups} 
                      onGroupToggle={handleGroupToggle} 
                      selectedMetric={activeYoyMetric} 
                    />
                  </section>
                </TabsContent>

                <TabsContent value="productPerformance" className="mt-8">
                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Product Performance Analysis</h2>
                    <ProductPerformanceTable 
                      data={allHistoricData} 
                      onRowClick={handleRowClick} 
                      selectedMetric={activeYoyMetric} 
                    />
                  </section>
                </TabsContent>

                <TabsContent value="categoryPerformance" className="mt-8">
                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Category Performance Analysis</h2>
                    <CategoryPerformanceTable 
                      data={allHistoricData} 
                      onRowClick={handleRowClick} 
                      selectedMetric={activeYoyMetric} 
                    />
                  </section>
                </TabsContent>

                <TabsContent value="soldByAnalysis" className="mt-8">
                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Sold By Analysis</h2>
                    <SoldByMonthOnMonthTable 
                      data={allHistoricData} 
                      onRowClick={handleRowClick} 
                      selectedMetric={activeYoyMetric} 
                    />
                  </section>
                </TabsContent>

                <TabsContent value="paymentMethodAnalysis" className="mt-8">
                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Payment Method Analysis</h2>
                    <PaymentMethodMonthOnMonthTable 
                      data={allHistoricData} 
                      onRowClick={handleRowClick} 
                      selectedMetric={activeYoyMetric} 
                    />
                  </section>
                </TabsContent>
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {drillDownData && (
        <EnhancedSalesDrillDownModal 
          isOpen={!!drillDownData} 
          onClose={() => setDrillDownData(null)} 
          data={drillDownData} 
          type={drillDownType} 
        />
      )}
    </div>
  );
};

export default SalesAnalyticsSection;
