import { getInteractiveLegendItemStyles } from '@patternfly/react-charts';
import { intl } from '../../i18n';
import messages from '../../../locales/messages';
import type { FormatOptions, Formatter } from './format';
import type { DomainTuple, VictoryStyleInterface } from 'victory-core';

import { getMaxMinValues, getTooltipContent } from './chart-datum';

export interface ChartData {
  childName?: string;
  units?: string;
}

export interface ChartLegendItem {
  childName?: string;
  name?: string;
  symbol?: any;
  tooltip?: string;
}

export interface ChartSeries {
  childName?: string;
  data?: [ChartData];
  legendItem?: ChartLegendItem;
  style?: VictoryStyleInterface;
}

// Returns groups of chart names associated with each data series
export const getChartNames = (series: ChartSeries[]) => {
  const result: (string | undefined)[] = [];

  if (series) {
    series.map(serie => {
      // Each group of chart names are hidden / shown together
      result.push(serie.childName);
    });
  }
  return result;
};

// Returns true if data series is hidden
export const isSeriesHidden = (hiddenSeries: Set<number>, index: number) => {
  return hiddenSeries.has(index);
};

// Note: A series may be grouped in order to be hidden / shown together
export const getDomain = (
  series: ChartSeries[] | undefined,
  hiddenSeries: Set<number>,
  groupedSeriesCount = 0,
) => {
  const domain: { x?: DomainTuple; y?: DomainTuple } = { y: [0, 1] };
  let maxValue: number | null = null;
  let minValue: number | null = null;

  if (series) {
    // Don't use zero domain
    let maybeEmptyHiddenSeries = hiddenSeries;
    if (series.length - groupedSeriesCount === maybeEmptyHiddenSeries.size) {
      domain.x = [0, 1];
      maybeEmptyHiddenSeries = new Set();
    }
    series.forEach((s: any, index) => {
      if (
        !isSeriesHidden(maybeEmptyHiddenSeries, index) &&
        s.data &&
        s.data.length !== 0
      ) {
        const { max, min } = getMaxMinValues(s.data);
        if (max !== null && (maxValue === null || max > maxValue)) {
          maxValue = max;
        }
        if (min !== null && (minValue === null || min < minValue)) {
          minValue = min;
        }
      }
    });
  }

  if (maxValue && minValue) {
    const threshold = maxValue * 0.05;
    const max = maxValue > 0 ? Math.ceil(maxValue + threshold) : 0;
    const _min =
      minValue > 0 ? Math.max(0, Math.floor(minValue - threshold)) : 0;
    const min = _min > 0 ? _min : 0;

    if (max > 0) {
      domain.y = [min, max];
    }
  }

  return domain;
};

// Returns legend data styled per hiddenSeries
export const getLegendData = (
  series?: ChartSeries[],
  hiddenSeries?: Set<number>,
  tooltip: boolean = false,
) => {
  if (!series) {
    return undefined;
  }

  const result: any = [];

  series.map((s, index) => {
    if (s.legendItem) {
      const data = {
        childName: s.childName,
        ...s.legendItem, // name property
        ...(tooltip && { name: s.legendItem.tooltip }), // Override name property for tooltip
        ...getInteractiveLegendItemStyles(hiddenSeries?.has(index)), // hidden styles
      };

      result.push(data);
    }
  });

  return result;
};

// Note: Forecast is expected to use both datum.y and datum.y0
export const getTooltipLabel = (
  datum: any,
  formatter: Formatter,
  formatOptions: FormatOptions,
) => {
  const tooltipFormatter = getTooltipContent(formatter);
  const dy =
    datum.y !== undefined && datum.y !== null
      ? tooltipFormatter(datum.y, datum.units, formatOptions)
      : undefined;
  const dy0 =
    datum.y0 !== undefined && datum.y0 !== null
      ? tooltipFormatter(datum.y0, datum.units, formatOptions)
      : undefined;

  if (dy !== undefined && dy0 !== undefined) {
    return intl.formatMessage(messages.chartCostForecastConeTooltip, {
      value0: dy0,
      value1: dy,
    });
  }
  return dy !== undefined ? dy : intl.formatMessage(messages.chartNoData);
};

export const getResizeObserver = (
  containerRef: HTMLDivElement | null,
  handleResize: () => void,
) => {
  const containerElement = containerRef;
  const { ResizeObserver } = window as any;
  let _resizeObserver: any;

  if (containerElement && ResizeObserver) {
    const resizeObserver = new ResizeObserver((entries: string | any[]) => {
      // We wrap it in requestAnimationFrame to avoid this error - ResizeObserver loop limit exceeded
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        handleResize();
      });
    });
    resizeObserver.observe(containerElement);
    _resizeObserver = () => resizeObserver.unobserve(containerElement);
  } else {
    handleResize();
    window.addEventListener('resize', handleResize);
    _resizeObserver = () => window.removeEventListener('resize', handleResize);
  }

  return () => {
    if (_resizeObserver) {
      _resizeObserver();
    }
  };
};

export const initHiddenSeries = (hiddenSeries: Set<number>, index: number) => {
  const result = new Set(hiddenSeries);
  if (!result.delete(index)) {
    result.add(index);
  }
  return result;
};

// Returns true if at least one data series is available
export const isDataAvailable = (
  series?: ChartSeries[],
  hiddenSeries?: Set<number>,
) => {
  const unavailable = []; // API data may not be available (e.g., on 1st of month)

  if (series) {
    series.forEach((s: any, index) => {
      if (
        (hiddenSeries && isSeriesHidden(hiddenSeries, index)) ||
        (s.data && s.data.length === 0)
      ) {
        unavailable.push(index);
      }
    });
  }
  return unavailable.length !== (series ? series.length : 0);
};

// Returns true if data series is hidden
export const isDataHidden = (
  series: ChartSeries[],
  hiddenSeries: Set<number>,
  data: any,
) => {
  if (data && data.length) {
    for (const key of hiddenSeries.keys()) {
      let dataChildName;
      let serieChildName;

      for (const item of data) {
        if (item.childName) {
          dataChildName = item.childName;
          break;
        }
      }

      if (series && key && series[key]?.data) {
        const seriesData = series[key]?.data;
        if (seriesData) {
          for (const item of seriesData) {
            if (item.childName) {
              serieChildName = item.childName;
              break;
            }
          }
        }
      }

      if (serieChildName && dataChildName && serieChildName === dataChildName) {
        return true;
      }
    }
  }
  return false;
};
