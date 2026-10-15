/**
 * Maps Supabase/Postgres error objects or codes to concise, helpful messages.
 * @param {any} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.';
  if (typeof error === 'string') return error;

  // Supabase/Postgres specific codes
  if (error.code === '23505') {
    if (error.message?.includes('serial_number') || error.message?.includes('imei')) {
      return 'This Serial Number / IMEI already exists in the system.';
    }
    if (error.message?.includes('invoice_number')) {
      return 'An invoice with this number has already been generated.';
    }
    return 'A record with this unique information already exists.';
  }

  if (error.code === '42501') {
    return 'Permission denied: your account is not authorized for this store or action.';
  }

  if (error.code === 'P0001') {
    // Custom exception raised in Postgres PL/pgSQL
    return error.message || 'Operation failed business validation.';
  }

  return error.message || 'Something went wrong. Please try again.';
}
