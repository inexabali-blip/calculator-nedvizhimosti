export const formatCurrency = (value: number, currency: string): string => {
  if (Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number, fractionDigits = 0): string => {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

export const formatPercent = (value: number, fractionDigits = 1): string => {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return `${formatNumber(value, fractionDigits)}%`;
};
