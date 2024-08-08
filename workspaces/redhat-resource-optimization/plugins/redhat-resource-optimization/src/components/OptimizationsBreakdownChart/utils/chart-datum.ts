import type { MessageDescriptor } from '@formatjs/intl/src/types';
import messages from '../../../locales/messages';
import { intl } from '../../i18n';
import { formatCurrency, unitsLookupKey } from './format';

export interface FormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface ChartDatum {
  childName?: string;
  date?: string;
  key: string | number;
  name?: string | number;
  show?: boolean;
  tooltip?: string;
  units: string;
  x: string | number;
  y: number;
  y0?: number;
}

export function getDatumDateRange(datums: ChartDatum[]): [Date, Date] {
  // Find the first populated (non-null) day
  let firstDay = 0;
  for (let i = firstDay; i < datums.length; i++) {
    if (datums[i]?.key && datums[i]?.y !== null) {
      firstDay = i;
      break;
    }
  }

  // Find the last populated (non-null) day
  let lastDay = datums.length - 1;
  for (let i = lastDay; i >= 0; i--) {
    if (datums[i]?.key && datums[i].y !== null) {
      lastDay = i;
      break;
    }
  }

  const start = new Date(datums[firstDay].key);
  const end = new Date(datums[lastDay].key);
  return [start, end];
}

export function getDateRangeString(
  datums: ChartDatum[],
  key: MessageDescriptor,
  isSameDate: boolean = false,
  noDataKey: MessageDescriptor = messages.chartNoData,
) {
  if (!(datums?.length && key)) {
    return intl.formatMessage(noDataKey);
  }

  const [start, end] = getDatumDateRange(datums);
  const dateRange = intl.formatDateTimeRange(isSameDate ? end : start, end, {
    day: 'numeric',
    month: 'short',
  });
  return intl.formatMessage(key, {
    dateRange,
  });
}

function getMinOrMaxY<F extends Math['max']>(
  datum: ChartDatum,
  minOrMaxFn: F,
): number | null {
  let value: number | null;

  if (datum.y0 !== undefined) {
    value = minOrMaxFn(datum.y, datum.y0) as number;
  } else {
    if (Array.isArray(datum.y)) {
      if (datum.y[0] !== null) {
        value = minOrMaxFn(...datum.y);
      } else if ((datum as any).yVal) {
        // yVal still remains a mistery...
        // For boxplot, which is hidden via `datum.y[0] = null` when all values are equal
        value = (datum as any).yVal;
      } else {
        value = null;
      }
    } else {
      value = datum.y;
    }
  }

  return value;
}

export function getMaxMinValues(datums: ChartDatum[]) {
  let max: number | null = null;
  let min: number | null = null;
  if (datums && datums.length) {
    datums.forEach(datum => {
      const maxY = getMinOrMaxY(datum, Math.max);
      const minY = getMinOrMaxY(datum, Math.min);

      if (maxY !== null && (max === null || maxY > max)) {
        max = maxY;
      }
      if (minY !== null && (min === null || minY < min)) {
        min = minY;
      }
    });
  }
  return { max, min };
}

export function getTooltipContent(
  formatter: (arg0: number, arg1: string, arg2: FormatOptions) => any,
) {
  return function labelFormatter(
    value: number,
    unit: string,
    options: FormatOptions = {},
  ) {
    const lookup = unitsLookupKey(unit);
    if (lookup) {
      return intl.formatMessage(messages.unitTooltips, {
        units: lookup,
        value: formatter(value, unit, options),
      });
    }
    return formatCurrency(value, unit, options);
  };
}
