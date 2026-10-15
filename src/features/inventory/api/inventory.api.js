import { supabase } from '@/shared/lib/supabase';

/**
 * Lists products for a store with category and inventory count
 */
export async function listProductsByStore({ storeId, categoryId, search } = {}) {
  let query = supabase
    .from('products')
    .select(`
      id, store_id, category_id, brand_id, name, slug, sku, description,
      is_serialized, cost_price, selling_price, min_selling_price,
      gst_rate, hsn_code, reorder_level, specs, is_active, created_at,
      categories (id, name, slug),
      brands (id, name, slug),
      inventory (quantity_on_hand, reserved_qty)
    `)
    .eq('store_id', storeId)
    .order('name');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Lists serialized units for a product or store
 */
export async function listProductUnits({ storeId, productId, status } = {}) {
  let query = supabase
    .from('product_units')
    .select('id, product_id, store_id, serial_number, condition_grade, battery_health, purchase_cost, status, warranty_months, notes, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Checks if an IMEI / Serial number is available globally
 * @param {string} serialNumber
 */
export async function checkSerialAvailability(serialNumber) {
  if (!serialNumber) return false;

  const { data, error } = await supabase
    .from('product_units')
    .select('id, serial_number, status')
    .eq('serial_number', serialNumber.trim())
    .maybeSingle();

  if (error) throw error;
  return !data; // true if available (no existing record)
}

/**
 * Creates a new product
 */
export async function createProduct(payload) {
  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select('id, store_id, name, sku, selling_price')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Adds a new serialized unit
 */
export async function createProductUnit(payload) {
  const { data, error } = await supabase
    .from('product_units')
    .insert([payload])
    .select('id, serial_number, status, condition_grade')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Adjusts inventory stock count and logs audit adjustment
 */
export async function adjustInventoryStock({ storeId, productId, newQuantity, previousQuantity, reason, notes }) {
  const changeQty = newQuantity - previousQuantity;

  // 1. Log adjustment in stock_adjustments table
  const { error: adjError } = await supabase
    .from('stock_adjustments')
    .insert({
      store_id: storeId,
      product_id: productId,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      change_quantity: changeQty,
      reason,
      notes,
    });

  if (adjError) {
    console.warn('Could not record stock adjustment audit log:', adjError.message);
  }

  // 2. Update quantity_on_hand in inventory table
  const { data, error } = await supabase
    .from('inventory')
    .upsert({
      store_id: storeId,
      product_id: productId,
      quantity_on_hand: newQuantity,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'store_id,product_id' })
    .select('store_id, product_id, quantity_on_hand')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates product pricing and GST configuration
 */
export async function updateProductPricing({ productId, sellingPrice, costPrice, minSellingPrice, gstRate }) {
  const { data, error } = await supabase
    .from('products')
    .update({
      selling_price: sellingPrice,
      cost_price: costPrice,
      min_selling_price: minSellingPrice,
      gst_rate: gstRate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .select('id, name, selling_price, cost_price, min_selling_price, gst_rate')
    .single();

  if (error) throw error;
  return data;
}
