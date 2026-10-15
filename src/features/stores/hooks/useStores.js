import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listStores, getStoreByCode, DEFAULT_STORES, getCachedStores } from '../api/stores.api';

export const storeKeys = {
  all: ['stores'],
  list: () => [...storeKeys.all, 'list'],
  detail: (code) => [...storeKeys.all, 'detail', code],
};

export function useStores() {
  return useQuery({
    queryKey: storeKeys.list(),
    queryFn: listStores,
    initialData: () => getCachedStores() || DEFAULT_STORES,
    staleTime: 1000 * 60 * 10,
  });
}

export function useStore(code) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: storeKeys.detail(code),
    queryFn: () => getStoreByCode(code),
    initialData: () => {
      const stores = queryClient.getQueryData(storeKeys.list());
      if (stores) {
        const found = stores.find((s) => s.code === code);
        if (found) return found;
      }
      const cached = getCachedStores();
      if (cached) {
        const found = cached.find((s) => s.code === code);
        if (found) return found;
      }
      return DEFAULT_STORES.find((s) => s.code === code) || null;
    },
    enabled: Boolean(code),
    staleTime: 1000 * 60 * 10,
  });
}
