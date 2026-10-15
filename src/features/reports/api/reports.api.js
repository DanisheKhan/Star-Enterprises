import { supabase } from '@/shared/lib/supabase';

/**
 * Fetches combined report metrics for the owner
 */
export async function getOwnerOverview() {
  const { data: invoices, error: invError } = await supabase
    .from('invoices')
    .select('id, store_id, grand_total, subtotal, cgst_amount, sgst_amount, created_at, stores (name, code)');

  if (invError) throw invError;

  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, store_id, cost_price, selling_price, inventory (quantity_on_hand), stores (name, code)');

  if (prodError) throw prodError;

  return {
    invoices: invoices || [],
    products: products || [],
  };
}
