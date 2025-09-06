import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, ChevronDown, ChevronRight, Users, Activity } from 'lucide-react';
import { TrainerMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { TrainerMetricTabs } from './TrainerMetricTabs';
import { ProcessedTrainerData, getMetricValue } from './TrainerDataProcessor';

interface EnhancedYearOnYearTrainerTableProps {
  data: ProcessedTrainerData[];
  defaultMetric?: TrainerMetricType;
  onRowClick?: (trainer: string, data: any) => void;
}

export const EnhancedYearOnYearTrainerTable = ({ 
  data, 
  defaultMetric = 'totalSessions',
  onRowClick 
}: EnhancedYearOnYearTrainerTableProps) => {
  const [selectedMetric, setSelectedMetric] = useState<TrainerMetricType>(defaultMetric);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Process data for year-on-year comparison with proper month grouping
  const processedData = useMemo(() => {
    const trainerGroups: Record<string, Record<string, ProcessedTrainerData>> = {};
    const monthYearSet = new Set<string>();

    // Group data by trainer
    data.forEach(record => {
      if (!trainerGroups[record.trainerName]) {
        trainerGroups[record.trainerName] = {};
      }
      trainerGroups[record.trainerName][record.monthYear] = record;
      monthYearSet.add(record.monthYear);
    });

    // Parse and organize months for year-on-year comparison
    const parseMonthYear = (monthStr: string) => {
      if (monthStr.includes('/')) {
        const [monthNum, year] = monthStr.split('/');
        return { 
          month: parseInt(monthNum), 
          year: parseInt(year),
          monthName: new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short' })
        };
      } else {
        const parts = monthStr.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthNum = monthNames.indexOf(parts[0]) + 1;
        const year = parseInt(parts[1]);
        return { month: monthNum, year, monthName: parts[0] };
      }
    };

    // Group months by month name across years
    const monthGroups: Record<string, { monthYear: string; year: number; month: number }[]> = {};
    
    Array.from(monthYearSet).forEach(monthYear => {
      const parsed = parseMonthYear(monthYear);
      if (!monthGroups[parsed.monthName]) {
        monthGroups[parsed.monthName] = [];
      }
      monthGroups[parsed.monthName].push({
        monthYear,
        year: parsed.year,
        month: parsed.month
      });
    });

    // Sort each month group by year and create comparison columns
    const organizedColumns: { monthName: string; years: { year: number; monthYear: string }[] }[] = [];
    
    Object.entries(monthGroups).forEach(([monthName, yearData]) => {
      const sortedYears = yearData
        .sort((a, b) => a.year - b.year)
        .map(item => ({ year: item.year, monthYear: item.monthYear }));
      
      organizedColumns.push({
        monthName,
        years: sortedYears
      });
    });

    // Sort columns by month number
    organizedColumns.sort((a, b) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames.indexOf(a.monthName) - monthNames.indexOf(b.monthName);
    });

    return { trainerGroups, organizedColumns };
  }, [data]);

  const formatValue = (value: number, metric: TrainerMetricType) => {
    switch (metric) {
      case 'totalPaid':
      case 'cycleRevenue':
      case 'barreRevenue':
        return formatCurrency(value);
      case 'retention':
      case 'conversion':
        return `${value.toFixed(1)}%`;
      case 'classAverageExclEmpty':
      case 'classAverageInclEmpty':
        return value.toFixed(1);
      default:
        return formatNumber(value);
    }
  };

  const getYearOnYearGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const toggleRowExpansion = (trainer: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(trainer)) {
      newExpanded.delete(trainer);
    } else {
      newExpanded.add(trainer);
    }
    setExpandedRows(newExpanded);
  };

  const handleRowClick = (trainer: string) => {
    const trainerData = processedData.trainerGroups[trainer];
    if (onRowClick) {
      onRowClick(trainer, {
        name: trainer,
        monthlyData: trainerData,
        organizedColumns: processedData.organizedColumns
      });
    }
  };

  // Calculate totals for each year-month combination
  const yearMonthTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    processedData.organizedColumns.forEach(({ years }) => {
      years.forEach(({ year, monthYear }) => {
        let total = 0;
        Object.values(processedData.trainerGroups).forEach(trainerData => {
          if (trainerData[monthYear]) {
            total += getMetricValue(trainerData[monthYear], selectedMetric);
          }
        });
        totals[`${year}-${monthYear}`] = total;
      });
    });
    
    return totals;
  }, [processedData, selectedMetric]);

  if (!data.length) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6">
          <p className="text-center text-slate-600">No trainer data available for year-on-year comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Enhanced Year-on-Year Trainer Analysis
          </CardTitle>
          <p className="text-sm text-gray-600">
            Month-by-month comparison across different years for {Object.keys(processedData.trainerGroups).length} trainers
          </p>
          <TrainerMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-20">
              <TableRow className="bg-gradient-to-r from-emerald-700 to-teal-900">
                <TableHead className="font-bold text-white sticky left-0 bg-emerald-800 z-30 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Trainer
                  </div>
                </TableHead>
                {processedData.organizedColumns.map(({ monthName, years }) => (
                  <React.Fragment key={monthName}>
                    {years.map(({ year, monthYear }) => (
                      <TableHead 
                        key={`${monthName}-${year}`} 
                        className="text-center font-bold text-white min-w-[120px] border-l border-emerald-600"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm">{monthName}</span>
                          <span className="text-emerald-200 text-xs">{year}</span>
                        </div>
                      </TableHead>
                    ))}
                    {years.length > 1 && (
                      <TableHead className="text-center font-bold text-white min-w-[100px] border-l-2 border-emerald-500">
                        <div className="flex flex-col">
                          <span className="text-xs">YoY Growth</span>
                          <span className="text-emerald-200 text-xs">{monthName}</span>
                        </div>
                      </TableHead>
                    )}
                  </React.Fragment>
                ))}
                <TableHead className="text-center font-bold text-white min-w-[120px] border-l-2 border-emerald-400">
                  Overall Performance
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Totals Row */}
              <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 font-bold">
                <TableCell className="font-bold text-emerald-800 sticky left-0 bg-gradient-to-r from-emerald-50 to-teal-50 z-10">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    TOTAL
                  </div>
                </TableCell>
                {processedData.organizedColumns.map(({ monthName, years }) => (
                  <React.Fragment key={`total-${monthName}`}>
                    {years.map(({ year, monthYear }) => (
                      <TableCell 
                        key={`total-${monthYear}`} 
                        className="text-center font-bold text-emerald-800"
                      >
                        {formatValue(yearMonthTotals[`${year}-${monthYear}`] || 0, selectedMetric)}
                      </TableCell>
                    ))}
                    {years.length > 1 && (
                      <TableCell className="text-center">
                        {(() => {
                          const latest = yearMonthTotals[`${years[years.length - 1].year}-${years[years.length - 1].monthYear}`] || 0;
                          const previous = yearMonthTotals[`${years[years.length - 2].year}-${years[years.length - 2].monthYear}`] || 0;
                          const growth = getYearOnYearGrowth(latest, previous);
                          return (
                            <Badge className={cn(
                              "flex items-center gap-1",
                              growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            )}>
                              {growth >= 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {Math.abs(growth).toFixed(1)}%
                            </Badge>
                          );
                        })()}
                      </TableCell>
                    )}
                  </React.Fragment>
                ))}
                <TableCell className="text-center font-bold text-emerald-800">
                  {formatValue(Object.values(yearMonthTotals).reduce((sum, val) => sum + val, 0), selectedMetric)}
                </TableCell>
              </TableRow>

              {/* Trainer Rows */}
              {Object.entries(processedData.trainerGroups).map(([trainer, trainerData]) => {
                const isExpanded = expandedRows.has(trainer);
                
                // Calculate overall trainer performance
                const allValues = processedData.organizedColumns.flatMap(({ years }) => 
                  years.map(({ monthYear }) => 
                    trainerData[monthYear] ? getMetricValue(trainerData[monthYear], selectedMetric) : 0
                  )
                );
                const trainerTotal = allValues.reduce((sum, val) => sum + val, 0);
                
                return (
                  <React.Fragment key={trainer}>
                    <TableRow 
                      className="hover:bg-slate-50/50 transition-colors border-b cursor-pointer"
                      onClick={() => handleRowClick(trainer)}
                    >
                      <TableCell className="font-medium text-slate-800 sticky left-0 bg-white z-10 border-r">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(trainer);
                            }}
                            className="p-1 h-6 w-6"
                          >
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </Button>
                          <span className="text-sm">{trainer}</span>
                        </div>
                      </TableCell>
                      {processedData.organizedColumns.map(({ monthName, years }) => (
                        <React.Fragment key={`${trainer}-${monthName}`}>
                          {years.map(({ year, monthYear }) => {
                            const value = trainerData[monthYear] ? getMetricValue(trainerData[monthYear], selectedMetric) : 0;
                            return (
                              <TableCell 
                                key={`${trainer}-${monthYear}`} 
                                className="text-center font-mono text-sm"
                              >
                                {formatValue(value, selectedMetric)}
                              </TableCell>
                            );
                          })}
                          {years.length > 1 && (
                            <TableCell className="text-center">
                              {(() => {
                                const latestData = trainerData[years[years.length - 1].monthYear];
                                const previousData = trainerData[years[years.length - 2].monthYear];
                                if (!latestData || !previousData) return <span className="text-gray-400">N/A</span>;
                                
                                const latest = getMetricValue(latestData, selectedMetric);
                                const previous = getMetricValue(previousData, selectedMetric);
                                const growth = getYearOnYearGrowth(latest, previous);
                                
                                return (
                                  <Badge
                                    className={cn(
                                      "flex items-center gap-1 w-fit mx-auto",
                                      growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    )}
                                  >
                                    {growth >= 0 ? (
                                      <TrendingUp className="w-3 h-3" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3" />
                                    )}
                                    {Math.abs(growth).toFixed(1)}%
                                  </Badge>
                                );
                              })()}
                            </TableCell>
                          )}
                        </React.Fragment>
                      ))}
                      <TableCell className="text-center font-bold text-slate-700">
                        {formatValue(trainerTotal, selectedMetric)}
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row Details */}
                    {isExpanded && (
                      <TableRow className="bg-gradient-to-r from-emerald-50/30 to-teal-50/30">
                        <TableCell colSpan={100} className="p-6">
                          <div className="space-y-6">
                            {/* Performance Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                <p className="text-slate-600 text-xs font-medium">Total Performance</p>
                                <p className="font-bold text-slate-800 text-lg">
                                  {formatValue(trainerTotal, selectedMetric)}
                                </p>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                <p className="text-slate-600 text-xs font-medium">Average per Period</p>
                                <p className="font-bold text-emerald-600 text-lg">
                                  {formatValue(allValues.length > 0 ? trainerTotal / allValues.filter(v => v > 0).length : 0, selectedMetric)}
                                </p>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                <p className="text-slate-600 text-xs font-medium">Peak Performance</p>
                                <p className="font-bold text-blue-600 text-lg">
                                  {formatValue(Math.max(...allValues), selectedMetric)}
                                </p>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                <p className="text-slate-600 text-xs font-medium">Consistency</p>
                                <p className="font-bold text-purple-600 text-lg">
                                  {allValues.length > 1 ? 
                                    (100 - (allValues.reduce((acc, val, i) => {
                                      if (i === 0) return acc;
                                      const change = Math.abs((val - allValues[i-1]) / Math.max(allValues[i-1], 1)) * 100;
                                      return acc + change;
                                    }, 0) / (allValues.length - 1))).toFixed(0) 
                                    : '100'
                                  }%
                                </p>
                              </div>
                            </div>

                            {/* Year-over-Year Analysis */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border">
                              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Year-over-Year Growth Analysis
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {processedData.organizedColumns
                                  .filter(({ years }) => years.length > 1)
                                  .map(({ monthName, years }) => {
                                    const latestData = trainerData[years[years.length - 1].monthYear];
                                    const previousData = trainerData[years[years.length - 2].monthYear];
                                    
                                    if (!latestData || !previousData) return null;
                                    
                                    const latest = getMetricValue(latestData, selectedMetric);
                                    const previous = getMetricValue(previousData, selectedMetric);
                                    const growth = getYearOnYearGrowth(latest, previous);
                                    
                                    return (
                                      <div key={monthName} className="bg-white p-3 rounded border">
                                        <div className="text-sm font-medium text-slate-700">{monthName}</div>
                                        <div className="flex items-center justify-between mt-1">
                                          <span className="text-xs text-slate-500">
                                            {years[years.length - 2].year} → {years[years.length - 1].year}
                                          </span>
                                          <Badge className={cn(
                                            "text-xs",
                                            growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                          )}>
                                            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                                          </Badge>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};