/**
 * Formats a numeric amount to Indian Rupee representation (e.g. ₹ 45,999.00 or ₹ 45,999).
 * @param {number|string|null|undefined} amount
 * @param {boolean} [showDecimals=false]
 * @returns {string}
 */
export function formatCurrency(amount, showDecimals = false) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount || '0');
  if (isNaN(num)) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(num);
}

/**
 * Formats an ISO date string to readable format (e.g., "15 Oct 2026, 03:45 PM").
 * @param {string|Date|null|undefined} dateInput
 * @param {boolean} [includeTime=true]
 * @returns {string}
 */
export function formatDate(dateInput, includeTime = true) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';

  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
  };

  return new Intl.DateTimeFormat('en-IN', options).format(d);
}

/**
 * Formats an Indian phone number cleanly.
 * @param {string|null|undefined} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '-';
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}
