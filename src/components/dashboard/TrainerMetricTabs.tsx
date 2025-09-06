
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrainerMetricType } from '@/types/dashboard';

interface TrainerMetricTabsProps {
  value: TrainerMetricType;
  onValueChange: (value: TrainerMetricType) => void;
  className?: string;
}

export const TrainerMetricTabs: React.FC<TrainerMetricTabsProps> = ({
  value,
  onValueChange,
  className = ""
}) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList className="grid w-full grid-cols-8 bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-16">
        <TabsTrigger
          value="totalSessions"
          className="text-xs px-2 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          Total Sessions
        </TabsTrigger>
        <TabsTrigger
          value="totalCustomers"
          className="text-xs px-2 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          Total Members
        </TabsTrigger>
        <TabsTrigger
          value="totalPaid"
          className="text-xs px-2 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          Total Revenue
        </TabsTrigger>
        <TabsTrigger
          value="classAverageExclEmpty"
          className="text-xs px-2 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          Class Avg (Excl Empty)
        </TabsTrigger>
        <TabsTrigger
          value="emptySessions"
          className="text-xs px-2 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          Empty Sessions
        </TabsTrigger>
        <TabsTrigger
          value="conversion"
          className="text-xs px-2 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          Conversion Rate
        </TabsTrigger>
        <TabsTrigger
          value="retention"
          className="text-xs px-2 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          Retention Rate
        </TabsTrigger>
        <TabsTrigger
          value="newMembers"
          className="text-xs px-2 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          New Members
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
