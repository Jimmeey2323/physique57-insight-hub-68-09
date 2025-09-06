
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePayrollData } from '@/hooks/usePayrollData';
import { EnhancedYearOnYearTrainerTable } from './EnhancedYearOnYearTrainerTable';
import { TrainerPerformanceDetailTable } from './TrainerPerformanceDetailTable';
import { TrainerEfficiencyAnalysisTable } from './TrainerEfficiencyAnalysisTable';
import { MonthOnMonthTrainerTable } from './MonthOnMonthTrainerTable';
import { EnhancedTrainerDrillDownModal } from './EnhancedTrainerDrillDownModal';
import { TrainerFilterSection } from './TrainerFilterSection';
import { TrainerMetricTabs } from './TrainerMetricTabs';
import { processTrainerData } from './TrainerDataProcessor';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Users, Calendar, TrendingUp, AlertCircle, Award, Target, DollarSign, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export const EnhancedTrainerPerformanceSection = () => {
  const { data: payrollData, isLoading, error } = usePayrollData();
  const [selectedTab, setSelectedTab] = useState('month-on-month');
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [filters, setFilters] = useState({ location: '', trainer: '', month: '' });

  const processedData = useMemo(() => {
    if (!payrollData || payrollData.length === 0) return [];
    let data = processTrainerData(payrollData);
    
    // Apply filters
    if (selectedLocation !== 'All Locations') {
      data = data.filter(d => d.location === selectedLocation);
    }
    if (filters.location) {
      data = data.filter(d => d.location === filters.location);
    }
    if (filters.trainer) {
      data = data.filter(d => d.trainerName === filters.trainer);
    }
    if (filters.month) {
      data = data.filter(d => d.monthYear === filters.month);
    }
    
    return data;
  }, [payrollData, filters, selectedLocation]);

  const handleRowClick = (trainer: string, data: any) => {
    setSelectedTrainer(trainer);
    setDrillDownData(data);
  };

  const closeDrillDown = () => {
    setSelectedTrainer(null);
    setDrillDownData(null);
  };

  // Calculate summary statistics and metrics
  const summaryStats = useMemo(() => {
    if (!processedData.length) return null;

    const totalTrainers = new Set(processedData.map(d => d.trainerName)).size;
    const totalSessions = processedData.reduce((sum, d) => sum + d.totalSessions, 0);
    const totalRevenue = processedData.reduce((sum, d) => sum + d.totalPaid, 0);
    const totalCustomers = processedData.reduce((sum, d) => sum + d.totalCustomers, 0);
    const avgClassSize = totalSessions > 0 ? totalCustomers / totalSessions : 0;
    const avgRevenue = totalTrainers > 0 ? totalRevenue / totalTrainers : 0;

    return {
      totalTrainers,
      totalSessions,
      totalRevenue,
      totalCustomers,
      avgClassSize,
      avgRevenue
    };
  }, [processedData]);

  // Top and bottom performers
  const topBottomPerformers = useMemo(() => {
    if (!processedData.length) return { top: [], bottom: [] };

    const trainerStats = processedData.reduce((acc, trainer) => {
      if (!acc[trainer.trainerName]) {
        acc[trainer.trainerName] = {
          name: trainer.trainerName,
          totalSessions: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          location: trainer.location
        };
      }
      acc[trainer.trainerName].totalSessions += trainer.totalSessions;
      acc[trainer.trainerName].totalRevenue += trainer.totalPaid;
      acc[trainer.trainerName].totalCustomers += trainer.totalCustomers;
      return acc;
    }, {} as Record<string, any>);

    const trainers = Object.values(trainerStats);
    const sortedByRevenue = [...trainers].sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

    return {
      top: sortedByRevenue.slice(0, 5),
      bottom: sortedByRevenue.slice(-5).reverse()
    };
  }, [processedData]);

  // Chart data
  const chartData = useMemo(() => {
    if (!processedData.length) return [];

    const monthlyData = processedData.reduce((acc, trainer) => {
      const month = trainer.monthYear;
      if (!acc[month]) {
        acc[month] = { month, sessions: 0, revenue: 0, customers: 0 };
      }
      acc[month].sessions += trainer.totalSessions;
      acc[month].revenue += trainer.totalPaid;
      acc[month].customers += trainer.totalCustomers;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }, [processedData]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-slate-600">Loading trainer performance data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>Error loading trainer data: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!processedData.length) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6">
          <p className="text-center text-slate-600">No trainer performance data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Tabs and Filter Section */}
      <div className="space-y-4">
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Location Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {['All Locations', ...Array.from(new Set(processedData.map(d => d.location)))].map((location) => (
                <button
                  key={location}
                  onClick={() => setSelectedLocation(location)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedLocation === location
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <TrainerFilterSection
          data={payrollData || []}
          onFiltersChange={setFilters}
          isCollapsed={isFiltersCollapsed}
          onToggleCollapse={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
        />
      </div>

      {/* Metric Cards */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Active Trainers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{summaryStats.totalTrainers}</div>
              <p className="text-xs text-blue-600">Total instructors</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Sessions</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{formatNumber(summaryStats.totalSessions)}</div>
              <p className="text-xs text-green-600">Classes conducted</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(summaryStats.totalRevenue)}</div>
              <p className="text-xs text-purple-600">Generated revenue</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Avg Class Size</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{summaryStats.avgClassSize.toFixed(1)}</div>
              <p className="text-xs text-orange-600">Members per class</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="sessions" stroke="#10B981" strokeWidth={2} name="Sessions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Sessions vs Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#10B981" name="Sessions" />
                <Bar dataKey="customers" fill="#8B5CF6" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top/Bottom Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Award className="w-5 h-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topBottomPerformers.top.map((trainer: any, index: number) => (
              <div key={trainer.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800">#{index + 1}</Badge>
                  <div>
                    <div className="font-medium text-green-900">{trainer.name}</div>
                    <div className="text-sm text-green-600">{trainer.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-900">{formatCurrency(trainer.totalRevenue)}</div>
                  <div className="text-sm text-green-600">{formatNumber(trainer.totalSessions)} sessions</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <TrendingUp className="w-5 h-5" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topBottomPerformers.bottom.map((trainer: any, index: number) => (
              <div key={trainer.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Badge className="bg-orange-100 text-orange-800">#{index + 1}</Badge>
                  <div>
                    <div className="font-medium text-orange-900">{trainer.name}</div>
                    <div className="text-sm text-orange-600">{trainer.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-900">{formatCurrency(trainer.totalRevenue)}</div>
                  <div className="text-sm text-orange-600">{formatNumber(trainer.totalSessions)} sessions</div>
                  <div className="text-xs text-orange-500">Growth potential</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-14">
          <TabsTrigger
            value="month-on-month"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
          >
            <Calendar className="w-4 h-4" />
            Month-on-Month Analysis
          </TabsTrigger>
          <TabsTrigger
            value="year-on-year"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
          >
            <TrendingUp className="w-4 h-4" />
            Year-on-Year Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="month-on-month" className="space-y-4">
          <MonthOnMonthTrainerTable
            data={processedData}
            defaultMetric="totalSessions"
            onRowClick={handleRowClick}
          />
        </TabsContent>

        <TabsContent value="year-on-year" className="space-y-4">
          <EnhancedYearOnYearTrainerTable
            data={processedData}
            defaultMetric="totalSessions"
            onRowClick={handleRowClick}
          />
          <TrainerPerformanceDetailTable
            data={processedData}
            onRowClick={handleRowClick}
          />
          <TrainerEfficiencyAnalysisTable
            data={processedData}
            onRowClick={handleRowClick}
          />
        </TabsContent>
      </Tabs>

      {/* Enhanced Drill Down Modal */}
      {selectedTrainer && drillDownData && (
        <EnhancedTrainerDrillDownModal
          isOpen={!!selectedTrainer}
          onClose={closeDrillDown}
          trainerName={selectedTrainer}
          trainerData={drillDownData}
        />
      )}
    </div>
  );
};
