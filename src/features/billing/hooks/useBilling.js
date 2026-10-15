import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placeSale, listInvoices, getInvoiceDetail } from '../api/billing.api';
import { inventoryKeys } from '@/features/inventory';

export const billingKeys = {
  all: ['billing'],
  invoices: (storeId) => [...billingKeys.all, 'invoices', storeId],
  detail: (invoiceId) => [...billingKeys.all, 'detail', invoiceId],
};

export function useInvoices(storeId) {
  return useQuery({
    queryKey: billingKeys.invoices(storeId),
    queryFn: () => listInvoices({ storeId }),
    enabled: Boolean(storeId),
  });
}

export function useInvoiceDetail(invoiceId) {
  return useQuery({
    queryKey: billingKeys.detail(invoiceId),
    queryFn: () => getInvoiceDetail(invoiceId),
    enabled: Boolean(invoiceId),
  });
}

export function usePlaceSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
