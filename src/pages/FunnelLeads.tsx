
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Target, TrendingUp, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useNavigate } from 'react-router-dom';

// Import components
import { FunnelLeadsFilterSection } from '@/components/dashboard/FunnelLeadsFilterSection';
import { FunnelMetricCards } from '@/components/dashboard/FunnelMetricCards';
import { FunnelInteractiveCharts } from '@/components/dashboard/FunnelInteractiveCharts';
import { FunnelMonthOnMonthTable } from '@/components/dashboard/FunnelMonthOnMonthTable';
import { FunnelYearOnYearTable } from '@/components/dashboard/FunnelYearOnYearTable';
import { FunnelSourceStageListsContainer } from '@/components/dashboard/FunnelSourceStageListsContainer';
import { FunnelHealthMetricsTable } from '@/components/dashboard/FunnelHealthMetricsTable';
import { FunnelStageAnalytics } from '@/components/dashboard/FunnelStageAnalytics';
import { LeadsFilterOptions } from '@/types/leads';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';

export default function FunnelLeads() {
  const { data: allLeadsData, loading, error } = useLeadsData();
  const navigate = useNavigate();
  
  const [activeLocation, setActiveLocation] = useState('all');
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  
  // Get previous month date range function
  const getPreviousMonthRange = () => {
    const now = new Date();
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      start: formatDate(firstDayPreviousMonth),
      end: formatDate(lastDayPreviousMonth)
    };
  };
  
  const [filters, setFilters] = useState<LeadsFilterOptions>(() => {
    const previousMonth = getPreviousMonthRange();
    return {
      dateRange: previousMonth,
      location: [],
      source: [],
      stage: [],
      status: [],
      associate: [],
      channel: [],
      trialStatus: [],
      conversionStatus: [],
      retentionStatus: [],
      minLTV: undefined,
      maxLTV: undefined
    };
  });

  // Define locations
  const locations = useMemo(() => {
    const predefinedLocations = [
      { id: 'all', name: 'All Locations', fullName: 'All Locations' },
      { id: 'kwality', name: 'Kwality House', fullName: 'Kwality House, Kemps Corner' },
      { id: 'supreme', name: 'Supreme HQ', fullName: 'Supreme HQ, Bandra' },
      { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
    ];
    
    return predefinedLocations;
  }, []);

  // Filter data by location
  const locationFilteredData = useMemo(() => {
    if (!allLeadsData || activeLocation === 'all') return allLeadsData || [];
    
    return allLeadsData.filter(lead => {
      const leadCenter = lead.center?.toLowerCase() || '';
      switch (activeLocation) {
        case 'kwality':
          return leadCenter.includes('kwality') || leadCenter.includes('kemps');
        case 'supreme':
          return leadCenter.includes('supreme') || leadCenter.includes('bandra');
        case 'kenkere':
          return leadCenter.includes('kenkere');
        default:
          return true;
      }
    });
  }, [allLeadsData, activeLocation]);

  // Apply additional filters to location-filtered data
  const filteredData = useMemo(() => {
    if (!locationFilteredData) return [];
    
    return locationFilteredData.filter(lead => {
      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const leadDate = new Date(lead.createdAt);
        if (filters.dateRange.start && leadDate < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && leadDate > new Date(filters.dateRange.end)) return false;
      }
      
      // Multi-select filters
      if (filters.location.length > 0 && !filters.location.some(loc => lead.center?.toLowerCase().includes(loc.toLowerCase()))) return false;
      if (filters.source.length > 0 && !filters.source.includes(lead.source)) return false;
      if (filters.stage.length > 0 && !filters.stage.includes(lead.stage)) return false;
      if (filters.status.length > 0 && !filters.status.includes(lead.status)) return false;
      if (filters.associate.length > 0 && !filters.associate.includes(lead.associate)) return false;
      if (filters.channel.length > 0 && !filters.channel.includes(lead.channel)) return false;
      if (filters.trialStatus.length > 0 && !filters.trialStatus.includes(lead.trialStatus)) return false;
      if (filters.conversionStatus.length > 0 && !filters.conversionStatus.includes(lead.conversionStatus)) return false;
      if (filters.retentionStatus.length > 0 && !filters.retentionStatus.includes(lead.retentionStatus)) return false;
      
      // LTV range filters
      if (filters.minLTV && lead.ltv < filters.minLTV) return false;
      if (filters.maxLTV && lead.ltv > filters.maxLTV) return false;
      
      return true;
    });
  }, [locationFilteredData, filters]);

  // Extract unique values for filter options
  const uniqueValues = useMemo(() => {
    if (!allLeadsData) return {
      locations: [], sources: [], stages: [], statuses: [], associates: [],
      channels: [], trialStatuses: [], conversionStatuses: [], retentionStatuses: []
    };

    return {
      locations: [...new Set(allLeadsData.map(lead => lead.center).filter(Boolean))],
      sources: [...new Set(allLeadsData.map(lead => lead.source).filter(Boolean))],
      stages: [...new Set(allLeadsData.map(lead => lead.stage).filter(Boolean))],
      statuses: [...new Set(allLeadsData.map(lead => lead.status).filter(Boolean))],
      associates: [...new Set(allLeadsData.map(lead => lead.associate).filter(Boolean))],
      channels: [...new Set(allLeadsData.map(lead => lead.channel).filter(Boolean))],
      trialStatuses: [...new Set(allLeadsData.map(lead => lead.trialStatus).filter(Boolean))],
      conversionStatuses: [...new Set(allLeadsData.map(lead => lead.conversionStatus).filter(Boolean))],
      retentionStatuses: [...new Set(allLeadsData.map(lead => lead.retentionStatus).filter(Boolean))]
    };
  }, [allLeadsData]);

  const handleFiltersChange = (newFilters: LeadsFilterOptions) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <Card className="p-8 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Loading Lead Data</p>
              <p className="text-sm text-gray-600">Analyzing funnel performance...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4">
        <Card className="p-8 bg-white shadow-lg max-w-md">
          <CardContent className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Connection Error</p>
              <p className="text-sm text-gray-600 mt-2">{error?.toString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Animated Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-10 w-24 h-24 bg-blue-300/20 rounded-full animate-bounce delay-1000"></div>
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
                <Target className="w-5 h-5" />
                <span className="font-medium">Lead Funnel Analysis</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-fade-in-up delay-200">
                Funnel & Leads
              </h1>
              
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                Comprehensive lead funnel analysis and conversion tracking
              </p>
              
              <div className="flex items-center justify-center gap-8 mt-8 animate-fade-in-up delay-500">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{filteredData.length.toLocaleString()}</div>
                  <div className="text-sm text-blue-200">Total Leads</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {filteredData.filter(lead => lead.conversionStatus === 'Converted').length}
                  </div>
                  <div className="text-sm text-blue-200">Converted</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {((filteredData.filter(lead => lead.conversionStatus === 'Converted').length / filteredData.length) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-200">Conversion Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Location Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
          <CardContent className="p-2">
            <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl h-auto gap-2">
                {locations.map((location) => (
                  <TabsTrigger
                    key={location.id}
                    value={location.id}
                    className="rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300"
                  >
                    <div className="text-center">
                      <div className="font-bold">{location.name}</div>
                      <div className="text-xs opacity-75">{location.fullName}</div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              {locations.map((location) => (
                <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
                  {/* Collapsible Filters Section */}
                  <Card className="bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Advanced Filters</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                          className="gap-2"
                        >
                          {filtersCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          {filtersCollapsed ? 'Show Filters' : 'Hide Filters'}
                        </Button>
                      </div>
                      {!filtersCollapsed && (
                        <FunnelLeadsFilterSection
                          filters={filters}
                          onFiltersChange={handleFiltersChange}
                          uniqueValues={uniqueValues}
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Metric Cards */}
                  <FunnelMetricCards data={filteredData} />

                  {/* Interactive Charts */}
                  <FunnelInteractiveCharts data={filteredData} />

                  {/* Source and Stage Lists Container */}
                  <FunnelSourceStageListsContainer data={filteredData} />

                  {/* Month on Month Table */}
                  <FunnelMonthOnMonthTable data={filteredData} />

                  {/* Year on Year Table - Uses ALL data, not filtered */}
                  <FunnelYearOnYearTable allData={locationFilteredData} />

                  {/* Health Metrics Table */}
                  <FunnelHealthMetricsTable data={filteredData} />

                  {/* Stage Analytics */}
                  <FunnelStageAnalytics data={filteredData} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

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
}
