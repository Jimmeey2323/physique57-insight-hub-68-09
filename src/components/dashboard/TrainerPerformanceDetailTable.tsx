import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Users, Activity, Target, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrainerPerformanceDetailTableProps {
  data: ProcessedTrainerData[];
  onRowClick?: (trainer: string, data: any) => void;
}

export const TrainerPerformanceDetailTable: React.FC<TrainerPerformanceDetailTableProps> = ({ 
  data, 
  onRowClick 
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'totalRevenue',
    direction: 'desc'
  });

  const processedTableData = useMemo(() => {
    // Aggregate data by trainer across all months
    const trainerStats = data.reduce((acc, record) => {
      const key = record.trainerName;
      
      if (!acc[key]) {
        acc[key] = {
          trainerName: record.trainerName,
          location: record.location,
          totalSessions: 0,
          totalCustomers: 0,
          totalRevenue: 0,
          cycleSessions: 0,
          barreSessions: 0,
          strengthSessions: 0,
          cycleRevenue: 0,
          barreRevenue: 0,
          strengthRevenue: 0,
          avgClassSize: 0,
          fillRate: 0,
          utilizationRate: 0,
          conversionRate: 0,
          retentionRate: 0,
          monthsActive: 0,
          revenuePerSession: 0,
          revenuePerCustomer: 0,
          consistencyScore: 0,
          performanceRating: 'Excellent' as const,
          topFormat: 'Cycle' as const,
          growthTrend: 0
        };
      }

      acc[key].totalSessions += record.totalSessions;
      acc[key].totalCustomers += record.totalCustomers;
      acc[key].totalRevenue += record.totalPaid;
      acc[key].cycleSessions += record.cycleSessions;
      acc[key].barreSessions += record.barreSessions;
      acc[key].strengthSessions += record.strengthSessions;
      acc[key].cycleRevenue += record.cycleRevenue;
      acc[key].barreRevenue += record.barreRevenue;
      acc[key].strengthRevenue += record.strengthRevenue;
      acc[key].monthsActive += 1;

      return acc;
    }, {} as Record<string, any>);

    // Calculate derived metrics
    return Object.values(trainerStats).map((trainer: any) => {
      trainer.avgClassSize = trainer.totalSessions > 0 ? trainer.totalCustomers / trainer.totalSessions : 0;
      trainer.revenuePerSession = trainer.totalSessions > 0 ? trainer.totalRevenue / trainer.totalSessions : 0;
      trainer.revenuePerCustomer = trainer.totalCustomers > 0 ? trainer.totalRevenue / trainer.totalCustomers : 0;
      trainer.fillRate = Math.random() * 30 + 70; // Mock data
      trainer.utilizationRate = Math.random() * 20 + 80; // Mock data
      trainer.conversionRate = Math.random() * 25 + 60; // Mock data
      trainer.retentionRate = Math.random() * 20 + 75; // Mock data
      trainer.consistencyScore = Math.random() * 25 + 75; // Mock data
      trainer.growthTrend = Math.random() * 40 - 20; // Mock data

      // Determine top format
      const formatRevenues = {
        'Cycle': trainer.cycleRevenue,
        'Barre': trainer.barreRevenue,
        'Strength': trainer.strengthRevenue
      };
      trainer.topFormat = Object.entries(formatRevenues).reduce((a, b) => 
        formatRevenues[a[0]] > formatRevenues[b[0]] ? a : b
      )[0];

      // Performance rating
      if (trainer.totalRevenue >= 50000) trainer.performanceRating = 'Excellent';
      else if (trainer.totalRevenue >= 30000) trainer.performanceRating = 'Good';
      else if (trainer.totalRevenue >= 15000) trainer.performanceRating = 'Average';
      else trainer.performanceRating = 'Needs Improvement';

      return trainer;
    }).sort((a, b) => {
      if (sortConfig.key === 'trainerName') {
        return sortConfig.direction === 'asc' 
          ? a.trainerName.localeCompare(b.trainerName)
          : b.trainerName.localeCompare(a.trainerName);
      }
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [data, sortConfig]);

  const handleRowClick = (rowData: any) => {
    if (onRowClick) {
      onRowClick(rowData.trainerName, {
        ...rowData,
        type: 'trainer-performance'
      });
    }
  };

  const columns = [
    {
      key: 'trainerName' as const,
      header: 'Trainer',
      className: 'font-semibold min-w-[160px]',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-slate-800">{value}</div>
          <div className="text-sm text-slate-500">{row.location}</div>
        </div>
      )
    },
    {
      key: 'totalSessions' as const,
      header: 'Sessions',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex flex-col items-center">
          <span className="font-semibold text-blue-600">{formatNumber(value)}</span>
          <Activity className="w-3 h-3 text-blue-400 mt-1" />
        </div>
      )
    },
    {
      key: 'totalCustomers' as const,
      header: 'Customers',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex flex-col items-center">
          <span className="font-semibold text-purple-600">{formatNumber(value)}</span>
          <Users className="w-3 h-3 text-purple-400 mt-1" />
        </div>
      )
    },
    {
      key: 'totalRevenue' as const,
      header: 'Revenue',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex flex-col items-center">
          <span className="font-semibold text-green-600">{formatCurrency(value)}</span>
          <div className="text-xs text-green-500 mt-1">Total</div>
        </div>
      )
    },
    {
      key: 'avgClassSize' as const,
      header: 'Avg Class Size',
      align: 'center' as const,
      render: (value: number) => (
        <span className="font-medium text-slate-700">{value.toFixed(1)}</span>
      )
    },
    {
      key: 'revenuePerSession' as const,
      header: 'Revenue/Session',
      align: 'center' as const,
      render: (value: number) => (
        <span className="font-medium text-orange-600">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'topFormat' as const,
      header: 'Top Format',
      align: 'center' as const,
      render: (value: string, row: any) => (
        <div className="flex flex-col items-center">
          <Badge className={`
            ${value === 'Cycle' ? 'bg-blue-100 text-blue-800' : 
              value === 'Barre' ? 'bg-pink-100 text-pink-800' : 
              'bg-green-100 text-green-800'}
          `}>
            {value}
          </Badge>
          <div className="text-xs text-slate-500 mt-1">
            {value === 'Cycle' ? row.cycleSessions : 
             value === 'Barre' ? row.barreSessions : 
             row.strengthSessions} sessions
          </div>
        </div>
      )
    },
    {
      key: 'fillRate' as const,
      header: 'Fill Rate',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex flex-col items-center">
          <span className={`font-semibold ${
            value >= 85 ? 'text-green-600' : 
            value >= 70 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {value.toFixed(1)}%
          </span>
          <Target className="w-3 h-3 text-slate-400 mt-1" />
        </div>
      )
    },
    {
      key: 'conversionRate' as const,
      header: 'Conversion',
      align: 'center' as const,
      render: (value: number) => (
        <span className={`font-semibold ${
          value >= 80 ? 'text-green-600' : 
          value >= 65 ? 'text-yellow-600' : 
          'text-red-600'
        }`}>
          {value.toFixed(1)}%
        </span>
      )
    },
    {
      key: 'performanceRating' as const,
      header: 'Rating',
      align: 'center' as const,
      render: (value: string, row: any) => (
        <div className="flex flex-col items-center">
          <Badge className={`
            ${value === 'Excellent' ? 'bg-green-100 text-green-800' :
              value === 'Good' ? 'bg-blue-100 text-blue-800' :
              value === 'Average' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'}
          `}>
            {value}
          </Badge>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            {row.growthTrend >= 0 ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
            )}
            {Math.abs(row.growthTrend).toFixed(0)}%
          </div>
        </div>
      )
    }
  ];

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Trainer Performance Detail Analysis
          <Badge variant="secondary" className="bg-white/20 text-white">
            {processedTableData.length} Trainers
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
          <ModernDataTable
            data={processedTableData}
            columns={columns}
            onRowClick={handleRowClick}
            headerGradient="from-blue-600 to-purple-600"
            showFooter={false}
            maxHeight="600px"
            stickyHeader={true}
          />
      </CardContent>
    </Card>
  );
};