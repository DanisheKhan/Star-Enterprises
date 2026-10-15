import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listProductsByStore,
  listProductUnits,
  createProductUnit,
} from '../api/inventory.api';

export const inventoryKeys = {
  all: ['inventory'],
  products: (storeId, filters) => [...inventoryKeys.all, 'products', storeId, filters],
  units: (storeId, productId, status) => [...inventoryKeys.all, 'units', storeId, productId, status],
};

export function useProducts(storeId, filters = {}) {
  return useQuery({
    queryKey: inventoryKeys.products(storeId, filters),
    queryFn: () => listProductsByStore({ storeId, ...filters }),
    enabled: Boolean(storeId),
  });
}

export function useProductUnits(storeId, productId = null, status = null) {
  return useQuery({
    queryKey: inventoryKeys.units(storeId, productId, status),
    queryFn: () => listProductUnits({ storeId, productId, status }),
    enabled: Boolean(storeId),
  });
}

export function useCreateProductUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
