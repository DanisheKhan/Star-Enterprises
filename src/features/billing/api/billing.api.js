import { supabase } from '@/shared/lib/supabase';

/**
 * Places a sale transaction atomically via database RPC
 */
export async function placeSale({
  storeId,
  customerName = 'Walk-in Customer',
  customerPhone = null,
  customerGstin = null,
  items,
  payments,
}) {
  const { data, error } = await supabase.rpc('place_sale', {
    p_store_id: storeId,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_gstin: customerGstin,
    p_items: items,
    p_payments: payments,
  });

  if (error) throw error;
  return data;
}

/**
 * Lists past invoices for a store
 */
export async function listInvoices({ storeId, limit = 20 } = {}) {
  const { data, error } = await supabase
    .from('invoices')
    .select('id, store_id, invoice_number, financial_year, customer_name, customer_phone, subtotal, discount_amount, cgst_amount, sgst_amount, grand_total, status, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Fetches complete invoice with items and payments for receipt printing
 */
export async function getInvoiceDetail(invoiceId) {
  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .select(`
      id, store_id, invoice_number, financial_year, customer_name, customer_phone, customer_gstin,
      subtotal, discount_amount, cgst_amount, sgst_amount, grand_total, status, created_at,
      stores (id, name, gstin, address_line1, city, pincode, phone, email)
    `)
    .eq('id', invoiceId)
    .single();

  if (invError) throw invError;

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, product_id, unit_id, item_name, serial_number, hsn_code, quantity, unit_price, discount, taxable_value, gst_rate, cgst_amount, sgst_amount, total_amount')
    .eq('invoice_id', invoiceId);

  if (itemsError) throw itemsError;

  const { data: payments, error: payError } = await supabase
    .from('payments')
    .select('id, payment_method, amount, reference_number')
    .eq('invoice_id', invoiceId);

  if (payError) throw payError;

  return {
    ...invoice,
    items: items || [],
    payments: payments || [],
  };
}
