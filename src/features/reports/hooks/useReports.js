import { useQuery } from '@tanstack/react-query';
import { getOwnerOverview, getOwnerDashboardData } from '../api/reports.api';

export const reportKeys = {
  all: ['reports'],
  owner: () => [...reportKeys.all, 'owner-overview'],
  dashboard: (dateRange) => [...reportKeys.all, 'owner-dashboard', dateRange],
};

export function useOwnerOverview() {
  return useQuery({
    queryKey: reportKeys.owner(),
    queryFn: getOwnerOverview,
  });
}

/**
 * Hook to retrieve full command center metrics for the Store Owner
 * @param {'today' | 'week' | 'month' | 'all'} [dateRange]
 */
export function useOwnerDashboard(dateRange = 'today') {
  return useQuery({
    queryKey: reportKeys.dashboard(dateRange),
    queryFn: () => getOwnerDashboardData({ dateRange }),
    staleTime: 1000 * 30, // 30 seconds fresh cache
    refetchInterval: 1000 * 60, // Auto-refresh every minute
  });
}

