import { useQuery } from '@tanstack/react-query';
import { getOwnerOverview } from '../api/reports.api';

export const reportKeys = {
  all: ['reports'],
  owner: () => [...reportKeys.all, 'owner-overview'],
};

export function useOwnerOverview() {
  return useQuery({
    queryKey: reportKeys.owner(),
    queryFn: getOwnerOverview,
  });
}
