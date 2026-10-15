import { useQuery } from '@tanstack/react-query';
import { listStores, getStoreByCode } from '../api/stores.api';

export const storeKeys = {
  all: ['stores'],
  list: () => [...storeKeys.all, 'list'],
  detail: (code) => [...storeKeys.all, 'detail', code],
};

export function useStores() {
  return useQuery({
    queryKey: storeKeys.list(),
    queryFn: listStores,
  });
}

export function useStore(code) {
  return useQuery({
    queryKey: storeKeys.detail(code),
    queryFn: () => getStoreByCode(code),
    enabled: Boolean(code),
  });
}
