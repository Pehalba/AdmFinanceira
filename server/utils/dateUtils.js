/**
 * Utilitários de data para o servidor
 */

/**
 * Gera monthKey no formato YYYY-MM
 */
export function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
