export const dateTimeFormat = (date: number | string, locales = 'en-US') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locales, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });
};

export const numberToShortText = (num: number = 0): string => {
  if (num >= 1e12) {
    return `${(num / 1e12).toFixed(1).replace(/\.0$/, '')}T`;
  } else if (num >= 1e9) {
    return `${(num / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
  } else if (num >= 1e6) {
    return `${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (num >= 1e3) {
    return `${(num / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return num.toString();
};

export const getObjValue = (t: Record<string, any>, path: string): unknown =>
  path.split('.').reduce((r, k) => r?.[k], t);
