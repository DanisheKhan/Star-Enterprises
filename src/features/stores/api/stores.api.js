import { supabase } from '@/shared/lib/supabase';

export const DEFAULT_STORES = [
  {
    id: '83a779be-95ac-4b81-9c96-9589dfb7df38',
    code: 'mobiles',
    name: 'Star Mobiles',
    gstin: '27AAAAA0000A1Z5',
    state_code: '27',
    legal_name: 'Star Enterprises',
    trade_name: 'Star Mobiles',
    address_line1: 'Shop 101, Main Road Market',
    city: 'Mumbai',
    pincode: '400001',
    phone: '+91 98200 12345',
    email: 'mobiles@starenterprises.in',
    invoice_prefix: 'MOB',
    is_active: true,
  },
  {
    id: '098552f2-915e-4b58-ad03-96fc66ec2c29',
    code: 'furniture-electronics',
    name: 'Star Furniture & Electronics',
    gstin: '27AAAAA0000A1Z5',
    state_code: '27',
    legal_name: 'Star Enterprises',
    trade_name: 'Star Furniture & Electronics',
    address_line1: 'Shop 102, Main Road Market',
    city: 'Mumbai',
    pincode: '400001',
    phone: '+91 98200 12346',
    email: 'fe@starenterprises.in',
    invoice_prefix: 'FE',
    is_active: true,
  },
];

const STORES_CACHE_KEY = 'star_stores_cache';

export function getCachedStores() {
  try {
    const raw = localStorage.getItem(STORES_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedStores(stores) {
  try {
    if (stores && stores.length > 0) {
      localStorage.setItem(STORES_CACHE_KEY, JSON.stringify(stores));
    }
  } catch {
    // Ignore localStorage write error
  }
}

/**
 * Lists all active stores
 */
export async function listStores() {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, code, name, gstin, state_code, legal_name, trade_name, address_line1, city, pincode, phone, email, invoice_prefix, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    if (data && data.length > 0) {
      setCachedStores(data);
      return data;
    }
    return getCachedStores() || DEFAULT_STORES;
  } catch (err) {
    console.warn('Network error loading stores, using cached/default stores:', err);
    return getCachedStores() || DEFAULT_STORES;
  }
}

/**
 * Gets a single store by its unique code ('mobiles' or 'furniture-electronics')
 * @param {string} code
 */
export async function getStoreByCode(code) {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, code, name, gstin, state_code, legal_name, trade_name, address_line1, city, pincode, phone, email, invoice_prefix, is_active')
      .eq('code', code)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn(`Network error loading store ${code}, using fallback:`, err);
    const cached = getCachedStores();
    if (cached) {
      const match = cached.find((s) => s.code === code);
      if (match) return match;
    }
    return DEFAULT_STORES.find((s) => s.code === code) || null;
  }
}
