/**
 * Valida email
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida senha (mínimo 6 caracteres)
 */
export function isValidPassword(password) {
  return password && password.length >= 6;
}

/**
 * Valida valor monetário
 */
export function isValidAmount(amount) {
  return typeof amount === 'number' && !isNaN(amount) && isFinite(amount);
}
