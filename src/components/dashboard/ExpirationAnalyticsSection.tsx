import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Filter, BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { NoteTaker } from '@/components/ui/NoteTaker';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { MetricCardData } from '@/types/dashboard';

// Define ExpirationData interface
export interface ExpirationData {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipType: string;
  expirationDate: string;
  daysUntilExpiration: number;
  status: 'active' | 'expiring' | 'expired';
  location: string;
  lastVisit?: string;
  totalVisits: number;
  value: number;
}

interface ExpirationAnalyticsSectionProps {
  data: ExpirationData[];
}

export const ExpirationAnalyticsSection: React.FC<ExpirationAnalyticsSectionProps> = ({ data }) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = data.length;
    const expiring30Days = data.filter(item => item.daysUntilExpiration <= 30 && item.daysUntilExpiration > 0).length;
    const expiring7Days = data.filter(item => item.daysUntilExpiration <= 7 && item.daysUntilExpiration > 0).length;
    const expired = data.filter(item => item.daysUntilExpiration <= 0).length;
    const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);

    const metricsData: MetricCardData[] = [
      {
        title: 'Total Memberships',
        value: formatNumber(total),
        change: 0,
        description: 'Total active and expiring memberships being tracked',
        calculation: 'Count of all membership records',
        icon: 'members',
        rawValue: total
      },
      {
        title: 'Expiring (30 Days)',
        value: formatNumber(expiring30Days),
        change: 0,
        description: 'Memberships expiring within the next 30 days',
        calculation: 'Count where days until expiration <= 30',
        icon: 'transactions',
        rawValue: expiring30Days
      },
      {
        title: 'Critical (7 Days)',
        value: formatNumber(expiring7Days),
        change: 0,
        description: 'Memberships expiring within the next 7 days - requires immediate attention',
        calculation: 'Count where days until expiration <= 7',
        icon: 'revenue',
        rawValue: expiring7Days
      },
      {
        title: 'Expired',
        value: formatNumber(expired),
        change: 0,
        description: 'Memberships that have already expired',
        calculation: 'Count where days until expiration <= 0',
        icon: 'members',
        rawValue: expired
      },
      {
        title: 'Total Value at Risk',
        value: formatCurrency(totalValue),
        change: 0,
        description: 'Total potential revenue from expiring memberships',
        calculation: 'Sum of all membership values',
        icon: 'revenue',
        rawValue: totalValue
      }
    ];

    return metricsData;
  }, [data]);

  const handleDrillDown = (metric: string) => {
    console.log('Drill down for metric:', metric);
  };

  return (
    <div className="space-y-8">
      {/* Note Taker Component - Fixed props */}
      <NoteTaker className="fixed bottom-6 right-6 z-50" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Membership Expiration Analytics</h2>
          <p className="text-gray-600 mt-2">Track and manage membership expirations</p>
        </div>
        <div className="flex gap-2">
          {/* Advanced Export Button - Fixed props */}
          <AdvancedExportButton 
            additionalData={{ expirations: data }}
            defaultFileName="membership-expiration-export"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metric Cards - Fixed props */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                data={metric}
                onClick={() => handleDrillDown(metric.title)}
              />
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Expiration Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Next 7 days</span>
                    <span className="font-semibold text-red-600">
                      {data.filter(item => item.daysUntilExpiration <= 7 && item.daysUntilExpiration > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Next 30 days</span>
                    <span className="font-semibold text-orange-600">
                      {data.filter(item => item.daysUntilExpiration <= 30 && item.daysUntilExpiration > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Next 90 days</span>
                    <span className="font-semibold text-yellow-600">
                      {data.filter(item => item.daysUntilExpiration <= 90 && item.daysUntilExpiration > 0).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  By Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(data.map(item => item.location))).slice(0, 3).map(location => (
                    <div key={location} className="flex justify-between">
                      <span className="text-sm text-gray-600">{location}</span>
                      <span className="font-semibold">
                        {data.filter(item => item.location === location).length}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  By Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="font-semibold text-green-600">
                      {data.filter(item => item.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expiring</span>
                    <span className="font-semibold text-orange-600">
                      {data.filter(item => item.status === 'expiring').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expired</span>
                    <span className="font-semibold text-red-600">
                      {data.filter(item => item.status === 'expired').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Memberships Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Expiring memberships data will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expired Memberships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Expired memberships data will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Advanced analytics will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};