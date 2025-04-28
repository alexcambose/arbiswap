/**
 * Formats a decimal value to a string with the specified number of decimal places
 * @param val - The value to format
 * @param decimals - The number of decimal places to format to
 * @returns The formatted value
 */
export const formatDecimal = (val: string | number, decimals = 18) => {
  if (val === undefined || val === null || val === '') return '';
  const num = Number(val);
  if (isNaN(num)) return val;
  return num.toFixed(decimals).replace(/\.?0+$/, '');
};
