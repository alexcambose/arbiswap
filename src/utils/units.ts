export const withCurrency = (value: number | string, currency: string) => {
  if (value === '0') return '0';
  return `${value} ${currency}`;
};
