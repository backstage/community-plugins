export interface FormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export type Formatter = (
  value: number,
  units: string,
  options?: FormatOptions,
) => string;
