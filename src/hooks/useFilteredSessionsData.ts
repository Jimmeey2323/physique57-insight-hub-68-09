
import { useMemo, useContext } from 'react';
import { SessionData } from '@/hooks/useSessionsData';
import { useSessionsFilters } from '@/contexts/SessionsFiltersContext';

export const useFilteredSessionsData = (data: SessionData[]) => {
  // Try to get filters context, but don't throw if it doesn't exist
  let filters = null;
  try {
    const context = useSessionsFilters();
    filters = context.filters;
  } catch (error) {
    // If we're not within a SessionsFiltersProvider, just use the data as-is
    filters = null;
  }

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter(session => {
      // Basic exclusions (existing logic)
      const className = session.cleanedClass || '';
      const excludeKeywords = ['Hosted', 'P57', 'X'];
      
      const hasExcludedKeyword = excludeKeywords.some(keyword => 
        className.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasExcludedKeyword || session.checkedInCount < 2) {
        return false;
      }

      // Only apply global filters if we have a filter context
      if (!filters) {
        return true; // No filters available, return all data that passed basic exclusions
      }

      // Apply global filters
      if (filters.trainers.length > 0 && !filters.trainers.includes(session.trainerName)) {
        return false;
      }

      if (filters.classTypes.length > 0 && !filters.classTypes.includes(session.cleanedClass)) {
        return false;
      }

      if (filters.dayOfWeek.length > 0 && !filters.dayOfWeek.includes(session.dayOfWeek)) {
        return false;
      }

      if (filters.timeSlots.length > 0 && !filters.timeSlots.includes(session.time)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const sessionDate = new Date(session.date);
        
        if (filters.dateRange.start && sessionDate < filters.dateRange.start) {
          return false;
        }
        
        if (filters.dateRange.end && sessionDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  return filteredData;
};
