import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { ModernDataTable } from '@/components/ui/ModernDataTable';

interface ClientConversionYearOnYearTableProps {
  data: NewClientData[];
}

export const ClientConversionYearOnYearTable: React.FC<ClientConversionYearOnYearTableProps> = ({ data }) => {
  const yearOnYearData = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const monthlyStats = data.reduce((acc, client) => {
      const date = new Date(client.firstVisitDate);
      if (isNaN(date.getTime())) return acc;
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (year === currentYear || year === previousYear) {
        const key = `${monthName}`;
        if (!acc[key]) {
          acc[key] = {
            month: monthName,
            sortOrder: month,
            currentYear: { newMembers: 0, converted: 0, retained: 0, totalLTV: 0 },
            previousYear: { newMembers: 0, converted: 0, retained: 0, totalLTV: 0 }
          };
        }
        
        const yearData = year === currentYear ? acc[key].currentYear : acc[key].previousYear;
        yearData.newMembers++;
        if (client.conversionStatus === 'Converted') yearData.converted++;
        if (client.retentionStatus === 'Retained') yearData.retained++;
        yearData.totalLTV += client.ltv || 0;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyStats)
      .map((stat: any) => {
        const currentConversionRate = stat.currentYear.newMembers > 0 ? (stat.currentYear.converted / stat.currentYear.newMembers) * 100 : 0;
        const previousConversionRate = stat.previousYear.newMembers > 0 ? (stat.previousYear.converted / stat.previousYear.newMembers) * 100 : 0;
        const currentRetentionRate = stat.currentYear.newMembers > 0 ? (stat.currentYear.retained / stat.currentYear.newMembers) * 100 : 0;
        const previousRetentionRate = stat.previousYear.newMembers > 0 ? (stat.previousYear.retained / stat.previousYear.newMembers) * 100 : 0;
        const currentAvgLTV = stat.currentYear.newMembers > 0 ? stat.currentYear.totalLTV / stat.currentYear.newMembers : 0;
        const previousAvgLTV = stat.previousYear.newMembers > 0 ? stat.previousYear.totalLTV / stat.previousYear.newMembers : 0;

        return {
          month: stat.month,
          sortOrder: stat.sortOrder,
          currentNewMembers: stat.currentYear.newMembers,
          previousNewMembers: stat.previousYear.newMembers,
          newMembersGrowth: stat.previousYear.newMembers > 0 ? ((stat.currentYear.newMembers - stat.previousYear.newMembers) / stat.previousYear.newMembers) * 100 : 0,
          currentConverted: stat.currentYear.converted,
          previousConverted: stat.previousYear.converted,
          currentConversionRate,
          previousConversionRate,
          conversionRateGrowth: previousConversionRate > 0 ? currentConversionRate - previousConversionRate : 0,
          currentRetained: stat.currentYear.retained,
          previousRetained: stat.previousYear.retained,
          currentRetentionRate,
          previousRetentionRate,
          retentionRateGrowth: previousRetentionRate > 0 ? currentRetentionRate - previousRetentionRate : 0,
          currentTotalLTV: stat.currentYear.totalLTV,
          previousTotalLTV: stat.previousYear.totalLTV,
          currentAvgLTV,
          previousAvgLTV,
          avgLTVGrowth: previousAvgLTV > 0 ? ((currentAvgLTV - previousAvgLTV) / previousAvgLTV) * 100 : 0
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [data]);

  const columns = [
    {
      key: 'month' as const,
      header: 'Month',
      className: 'font-semibold min-w-[80px]'
    },
    {
      key: 'currentNewMembers' as const,
      header: `${new Date().getFullYear()} New`,
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold text-blue-600">{formatNumber(value)}</span>
    },
    {
      key: 'previousNewMembers' as const,
      header: `${new Date().getFullYear() - 1} New`,
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold text-gray-600">{formatNumber(value)}</span>
    },
    {
      key: 'newMembersGrowth' as const,
      header: 'Growth %',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          {value > 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : value < 0 ? <TrendingDown className="w-3 h-3 text-red-500" /> : null}
          <span className={`font-semibold ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {value.toFixed(1)}%
          </span>
        </div>
      )
    },
    {
      key: 'currentConversionRate' as const,
      header: `${new Date().getFullYear()} Conv.`,
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold text-green-600">{value.toFixed(1)}%</span>
    },
    {
      key: 'previousConversionRate' as const,
      header: `${new Date().getFullYear() - 1} Conv.`,
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold text-gray-600">{value.toFixed(1)}%</span>
    },
    {
      key: 'conversionRateGrowth' as const,
      header: 'Conv. Δ',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          {value > 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : value < 0 ? <TrendingDown className="w-3 h-3 text-red-500" /> : null}
          <span className={`font-semibold ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {value > 0 ? '+' : ''}{value.toFixed(1)}pp
          </span>
        </div>
      )
    },
    {
      key: 'currentAvgLTV' as const,
      header: `${new Date().getFullYear()} LTV`,
      align: 'right' as const,
      render: (value: number) => <span className="font-semibold text-purple-600">{formatCurrency(value)}</span>
    },
    {
      key: 'previousAvgLTV' as const,
      header: `${new Date().getFullYear() - 1} LTV`,
      align: 'right' as const,
      render: (value: number) => <span className="font-semibold text-gray-600">{formatCurrency(value)}</span>
    },
    {
      key: 'avgLTVGrowth' as const,
      header: 'LTV Growth',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          {value > 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : value < 0 ? <TrendingDown className="w-3 h-3 text-red-500" /> : null}
          <span className={`font-semibold ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {value.toFixed(1)}%
          </span>
        </div>
      )
    }
  ];

  // Calculate totals
  const totals = {
    month: 'TOTAL',
    currentNewMembers: yearOnYearData.reduce((sum, row) => sum + row.currentNewMembers, 0),
    previousNewMembers: yearOnYearData.reduce((sum, row) => sum + row.previousNewMembers, 0),
    newMembersGrowth: 0,
    currentConversionRate: 0,
    previousConversionRate: 0,
    conversionRateGrowth: 0,
    currentAvgLTV: yearOnYearData.reduce((sum, row) => sum + row.currentTotalLTV, 0) / yearOnYearData.reduce((sum, row) => sum + row.currentNewMembers, 1),
    previousAvgLTV: yearOnYearData.reduce((sum, row) => sum + row.previousTotalLTV, 0) / yearOnYearData.reduce((sum, row) => sum + row.previousNewMembers, 1),
    avgLTVGrowth: 0
  };

  const totalCurrentConverted = yearOnYearData.reduce((sum, row) => sum + row.currentConverted, 0);
  const totalPreviousConverted = yearOnYearData.reduce((sum, row) => sum + row.previousConverted, 0);

  totals.newMembersGrowth = totals.previousNewMembers > 0 ? ((totals.currentNewMembers - totals.previousNewMembers) / totals.previousNewMembers) * 100 : 0;
  totals.currentConversionRate = totals.currentNewMembers > 0 ? (totalCurrentConverted / totals.currentNewMembers) * 100 : 0;
  totals.previousConversionRate = totals.previousNewMembers > 0 ? (totalPreviousConverted / totals.previousNewMembers) * 100 : 0;
  totals.conversionRateGrowth = totals.previousConversionRate > 0 ? totals.currentConversionRate - totals.previousConversionRate : 0;
  totals.avgLTVGrowth = totals.previousAvgLTV > 0 ? ((totals.currentAvgLTV - totals.previousAvgLTV) / totals.previousAvgLTV) * 100 : 0;

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Year-on-Year Client Conversion Comparison
          <Badge variant="secondary" className="bg-white/20 text-white">
            {new Date().getFullYear()} vs {new Date().getFullYear() - 1}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ModernDataTable
          data={yearOnYearData}
          columns={columns}
          headerGradient="from-emerald-600 to-teal-600"
          showFooter={true}
          footerData={totals}
          maxHeight="600px"
        />
      </CardContent>
    </Card>
  );
};
