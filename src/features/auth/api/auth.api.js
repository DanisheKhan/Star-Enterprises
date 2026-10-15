import { supabase } from '@/shared/lib/supabase';

/**
 * Sign in user with email and password
 * @param {{ email: string, password: string }} credentials
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Fetch profile and store assignments for the authenticated user
 * @param {string} userId
 */
export async function getUserProfile(userId) {
  if (!userId) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    throw profileError;
  }

  const { data: storeAccess, error: accessError } = await supabase
    .from('staff_store_access')
    .select('id, store_id, role, is_active')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (accessError) throw accessError;

  return {
    profile: profile || { id: userId, full_name: 'Demo Staff', role: 'owner' },
    storeAccess: storeAccess || [],
  };
}
