import { supabase } from '@/shared/lib/supabase';

/**
 * Creates a new second-hand mobile buyback intake record
 */
export async function createBuybackIntake(payload) {
  // First verify IMEI uniqueness across product_units
  const { data: existingUnit } = await supabase
    .from('product_units')
    .select('id, serial_number')
    .eq('serial_number', payload.imei.trim())
    .maybeSingle();

  if (existingUnit) {
    throw new Error('This IMEI is already registered in active inventory or was previously sold.');
  }

  const { data, error } = await supabase
    .from('second_hand_intakes')
    .insert([payload])
    .select('id, store_id, seller_name, brand_name, model_name, imei, calculated_grade, agreed_price, status, created_at')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Lists past second-hand intake records for a store
 */
export async function listBuybackIntakes(storeId) {
  const { data, error } = await supabase
    .from('second_hand_intakes')
    .select('id, store_id, seller_name, seller_phone, seller_id_type, seller_id_number, brand_name, model_name, imei, calculated_grade, agreed_price, status, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
