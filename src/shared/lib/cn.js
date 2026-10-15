/**
 * Joins class names, filtering out falsy values.
 * @param  {...(string|boolean|undefined|null)} parts
 * @returns {string}
 */
export const cn = (...parts) => parts.filter(Boolean).join(' ');
