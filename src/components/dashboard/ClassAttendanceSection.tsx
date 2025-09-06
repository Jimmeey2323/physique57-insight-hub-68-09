import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, BarChart3, Users, Target, Filter, MapPin, Building2, Home } from 'lucide-react';
import { useSessionsData, SessionData } from '@/hooks/useSessionsData';
import { useFilteredSessionsData } from '@/hooks/useFilteredSessionsData';
import { ClassAttendanceFilterSection } from './ClassAttendanceFilterSection';
import { EnhancedClassAttendanceMetricCards } from './EnhancedClassAttendanceMetricCards';
import { EnhancedClassFormatRankings } from './EnhancedClassFormatRankings';
import { ComprehensiveHostedClassesTable } from './ComprehensiveHostedClassesTable';
import { EnhancedMultiViewTable } from './EnhancedMultiViewTable';
import { ComprehensiveClassFormatComparison } from './ComprehensiveClassFormatComparison';
import { useNavigate } from 'react-router-dom';

const locations = [{
  id: 'all',
  name: 'All Locations',
  fullName: 'All Locations'
}, {
  id: 'Kwality House, Kemps Corner',
  name: 'Kwality House',
  fullName: 'Kwality House, Kemps Corner'
}, {
  id: 'Supreme HQ, Bandra',
  name: 'Supreme HQ',
  fullName: 'Supreme HQ, Bandra'
}, {
  id: 'Kenkere House',
  name: 'Kenkere House',
  fullName: 'Kenkere House'
}];

export const ClassAttendanceSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: sessionsData, loading, error, refetch } = useSessionsData();
  const [activeLocation, setActiveLocation] = useState('all');
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [compareWithTrainer, setCompareWithTrainer] = useState(false);

  // Apply filters to the data
  const filteredData = useFilteredSessionsData(sessionsData || []);

  // Filter data by location
  const locationFilteredData = useMemo(() => {
    if (!filteredData || activeLocation === 'all') return filteredData || [];
    
    const selectedLocation = locations.find(loc => loc.id === activeLocation);
    if (!selectedLocation) return filteredData || [];

    return filteredData.filter(session => {
      if (session.location === selectedLocation.fullName) return true;
      
      const sessionLoc = session.location?.toLowerCase() || '';
      const targetLoc = selectedLocation.fullName.toLowerCase();
      
      if (selectedLocation.id === 'Kwality House, Kemps Corner' && sessionLoc.includes('kwality')) return true;
      if (selectedLocation.id === 'Supreme HQ, Bandra' && sessionLoc.includes('supreme')) return true;
      if (selectedLocation.id === 'Kenkere House' && sessionLoc.includes('kenkere')) return true;
      
      return false;
    });
  }, [filteredData, activeLocation]);

  // Get unique class formats
  const uniqueClassFormats = useMemo(() => {
    if (!locationFilteredData) return [];
    return [...new Set(locationFilteredData.map(session => session.cleanedClass || session.classType).filter(Boolean))];
  }, [locationFilteredData]);

  // Get hosted classes (classes that contain "Hosted" in sessionName)
  const hostedClasses = useMemo(() => {
    if (!locationFilteredData) return [];
    return locationFilteredData.filter(session => 
      session.sessionName?.toLowerCase().includes('hosted') || 
      session.sessionName?.toLowerCase().includes('myriad')
    );
  }, [locationFilteredData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading class attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data: {error}</p>
          <Button onClick={refetch} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  if (!sessionsData || sessionsData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">No class attendance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Filter Section */}
        <ClassAttendanceFilterSection data={sessionsData || []} />

        {/* Location Tabs */}
        <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid grid-cols-4 w-full max-w-3xl overflow-hidden">
              {locations.map(location => (
                <TabsTrigger 
                  key={location.id} 
                  value={location.id} 
                  className="relative rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    {location.id === 'all' ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    <div className="text-center">
                      <div className="font-bold">{location.name.split(',')[0]}</div>
                      {location.name.includes(',') && <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>}
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {locations.map(location => (
            <TabsContent key={location.id} value={location.id} className="space-y-8">
              {/* Enhanced Metrics Cards */}
              <EnhancedClassAttendanceMetricCards data={locationFilteredData} />

              {/* Enhanced Class Format Rankings */}
              <EnhancedClassFormatRankings data={locationFilteredData} />

              {/* Comprehensive Class Format Analysis */}
              <ComprehensiveClassFormatComparison 
                data={locationFilteredData}
                selectedFormats={selectedFormats}
                onFormatsChange={setSelectedFormats}
                compareWithTrainer={compareWithTrainer}
                onCompareWithTrainerChange={setCompareWithTrainer}
              />

              {/* Enhanced Multi-View Analysis Table */}
              <EnhancedMultiViewTable data={locationFilteredData} />

              {/* Comprehensive Hosted Classes Table */}
              <ComprehensiveHostedClassesTable data={hostedClasses} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};