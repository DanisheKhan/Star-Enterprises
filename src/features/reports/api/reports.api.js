import { supabase } from '@/shared/lib/supabase';

/**
 * Fetches combined report metrics for the owner
 */
export async function getOwnerOverview() {
  const [invRes, prodRes] = await Promise.all([
    supabase
      .from('invoices')
      .select('id, store_id, grand_total, subtotal, cgst_amount, sgst_amount, created_at, stores (name, code)'),
    supabase
      .from('products')
      .select('id, store_id, cost_price, selling_price, inventory (quantity_on_hand), stores (name, code)'),
  ]);

  if (invRes.error) throw invRes.error;
  if (prodRes.error) throw prodRes.error;

  return {
    invoices: invRes.data || [],
    products: prodRes.data || [],
  };
}
