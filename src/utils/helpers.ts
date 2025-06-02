export const safeFloat = (value: string | undefined | null, defaultValue: number = 0): number => {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const safeGet = (obj: any, path: string, defaultValue: any = undefined) => {
  try {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const formatNumber = (num: number, decimals = 2): string => {
  if (Math.abs(num) >= 1000000000) {
    return `${(num / 1000000000).toFixed(decimals)}B`;
  }
  if (Math.abs(num) >= 1000000) {
    return `${(num / 1000000).toFixed(decimals)}M`;
  }
  if (Math.abs(num) >= 1000) {
    return `${(num / 1000).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
}; 