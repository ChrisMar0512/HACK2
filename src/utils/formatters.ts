/**
 * Utilidades de formateo para el proyecto
 */

export const formatBerries = (amount: number): string => {
  return `฿ ${amount.toLocaleString('en-US')}`;
};
