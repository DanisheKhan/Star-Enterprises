import { supabase } from '@/shared/lib/supabase';

/**
 * Lists all active stores
 */
export async function listStores() {
  const { data, error } = await supabase
    .from('stores')
    .select('id, code, name, gstin, state_code, legal_name, trade_name, address_line1, city, pincode, phone, email, invoice_prefix, is_active')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Gets a single store by its unique code ('mobiles' or 'furniture-electronics')
 * @param {string} code
 */
export async function getStoreByCode(code) {
  const { data, error } = await supabase
    .from('stores')
    .select('id, code, name, gstin, state_code, legal_name, trade_name, address_line1, city, pincode, phone, email, invoice_prefix, is_active')
    .eq('code', code)
    .single();

  if (error) throw error;
  return data;
}
