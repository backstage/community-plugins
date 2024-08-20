import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartBoxPlot,
  ChartLegend,
  ChartLegendTooltip,
  ChartScatter,
  createContainer,
  getInteractiveLegendEvents,
} from '@patternfly/react-charts';

import { useIntl } from 'react-intl';
import messages from '../../../locales/messages';

import { getDateRangeString } from '../utils/chart-datum';

import type { ChartSeries } from '../utils/chart-utils';
import {
  getDomain,
  getLegendData,
  getResizeObserver,
  initHiddenSeries,
  isDataAvailable,
  isSeriesHidden,
} from '../utils/chart-utils';

import ChartTheme from '../theme';

import { unitsLookupKey } from '../utils/format';
import { chartStyles } from './optimizationsBreakdownChart.styles';
import { useOptimizationsBreakdownChartStyles } from './OptimizationsBreakdownChartStyles';

interface OptimizationsBreakdownChartOwnProps {
  baseHeight: number;
  limitData?: any;
  name?: string;
  padding?: any;
  requestData?: any;
  usageData?: any;
}

type OptimizationsBreakdownChartProps = OptimizationsBreakdownChartOwnProps;

const OptimizationsBreakdownChart: React.FC<
  OptimizationsBreakdownChartProps
> = ({ baseHeight, name, limitData, padding, requestData, usageData }) => {
  const [containerRef] = useState(React.createRef<HTMLDivElement>());
  const [cursorVoronoiContainer, setCursorVoronoiContainer] = useState<any>();
  const [extraHeight, setExtraHeight] = useState(0);
  const [hiddenSeries, setHiddenSeries] = useState(new Set<number>());
  const [series, setSeries] = useState<ChartSeries[]>();
  const [width, setWidth] = useState(0);
  const intl = useIntl();
  const classes = useOptimizationsBreakdownChartStyles();

  // Clone original container. See https://issues.redhat.com/browse/COST-762
  const cloneContainer = () => {
    const legendData = getLegendData(series, hiddenSeries, true);
    // Force extra space for line wrapping
    legendData?.push(
      {
        childName: 'usage',
        name: '',
        symbol: {
          fill: 'none',
        },
      },
      {
        childName: 'usage',
        name: '',
        symbol: {
          fill: 'none',
        },
      },
    );
    return cursorVoronoiContainer
      ? React.cloneElement(cursorVoronoiContainer, {
          disable: !isDataAvailable(series, hiddenSeries),
          labelComponent: (
            <ChartLegendTooltip
              legendData={legendData}
              title={datum => `${datum.x}`}
            />
          ),
        } as any)
      : undefined;
  };

  const getLimitChart = () => {
    return series?.map((serie, index) => {
      if (serie.childName === 'limit') {
        return (
          <ChartArea
            data={!hiddenSeries.has(index) ? serie.data : [{ y: null }]}
            interpolation="monotoneX"
            key={serie.childName}
            name={serie.childName}
            style={serie.style}
          />
        );
      }
      return null;
    });
  };

  const getRequestChart = () => {
    return series?.map((serie, index) => {
      if (serie.childName === 'request') {
        return (
          <ChartArea
            data={!hiddenSeries.has(index) ? serie.data : [{ y: null }]}
            interpolation="monotoneX"
            key={serie.childName}
            name={serie.childName}
            style={serie.style}
          />
        );
      }
      return null;
    });
  };

  const getScatterChart = () => {
    return series?.map((serie, index) => {
      if (serie.childName === 'scatter') {
        return (
          <ChartScatter
            data={!hiddenSeries.has(index - 1) ? serie.data : [{ y: null }]}
            key={serie.childName}
            name={serie.childName}
            style={serie.style}
          />
        );
      }
      return null;
    });
  };

  const getUsageChart = () => {
    return series?.map((serie, index) => {
      if (serie.childName === 'usage') {
        return (
          <ChartBoxPlot
            boxWidth={width < 475 ? 15 : undefined}
            data={!hiddenSeries.has(index) ? serie.data : [{ y: [null] }]}
            key={serie.childName}
            name={serie.childName}
            style={serie.style}
          />
        );
      }
      return null;
    });
  };

  // Returns groups of chart names associated with each data series
  const getChartNames = () => {
    const result: (string | string[] | undefined)[] = [];

    if (series) {
      series.map(serie => {
        // Each group of chart names are hidden / shown together
        if (serie.childName === 'usage') {
          result.push([serie.childName, 'scatter']);
        } else if (serie.childName !== 'scatter') {
          result.push(serie.childName);
        }
      });
    }
    return result as any;
  };

  const getPadding = useCallback(() => {
    return padding
      ? padding
      : {
          bottom: 75 + extraHeight, // Maintain chart aspect ratio
          left: 50,
          right: 50,
          top: 10,
        };
  }, [extraHeight, padding]);

  // Hide each data series individually
  const handleOnLegendClick = (index: number) => {
    const newHiddenSeries = initHiddenSeries(hiddenSeries, index);
    setHiddenSeries(newHiddenSeries);
  };

  // Returns CursorVoronoiContainer component
  const getCursorVoronoiContainer = useCallback(() => {
    // Note: Container order is important
    const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

    const labelFormatter = (datum: {
      childName: string;
      _min: undefined;
      _max: undefined;
      _median: undefined;
      _q1: undefined;
      _q3: undefined;
      yVal: null;
      units: string;
      y: any[];
    }) => {
      const formatValue = (val: undefined | null) =>
        val !== undefined ? val : '';
      if (datum.childName === 'scatter') {
        return null;
      } else if (
        datum.childName === 'usage' &&
        (datum._min !== undefined ||
          datum._max !== undefined ||
          datum._median !== undefined ||
          datum._q1 !== undefined ||
          datum._q3 !== undefined ||
          datum.yVal !== null)
      ) {
        return intl.formatMessage(messages.chartUsageTooltip, {
          br: '\n',
          min: formatValue(datum._min !== undefined ? datum._min : datum.yVal),
          max: formatValue(datum._max !== undefined ? datum._max : datum.yVal),
          median: formatValue(
            datum._median !== undefined ? datum._median : datum.yVal,
          ),
          q1: formatValue(datum._q1 !== undefined ? datum._q1 : datum.yVal),
          q3: formatValue(datum._q3 !== undefined ? datum._q3 : datum.yVal),
          units: intl.formatMessage(messages.units, {
            units: unitsLookupKey(datum.units),
          }),
        });
      }

      // With box plot, datum.y will be an array
      const yVal = Array.isArray(datum.y) ? datum.y[0] : datum.y;
      let units = datum.units;

      /**
       * The recommendations API intentionally omits CPU request and limit units when "cores".
       *
       * The yaml format for the resource units needs to adhere to the Kubernetes standard that is outlined here
       * https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
       *
       * Example. "45 millicores" is represented as "45m", 64 MiB is represented as "64Mi",
       * 2.3 cores is represented as "2.3" (Note cores is not specified)
       */
      if (
        (datum.childName === 'limit' || datum.childName === 'request') &&
        datum.units === ''
      ) {
        units = unitsLookupKey('cores');
      }
      return yVal !== null
        ? intl.formatMessage(messages.valueUnits, {
            value: yVal,
            units: intl.formatMessage(messages.units, {
              units: unitsLookupKey(units),
            }),
          })
        : intl.formatMessage(messages.chartNoData);
    };

    return (
      <CursorVoronoiContainer
        cursorDimension="x"
        labels={({ datum }: any) => labelFormatter(datum)}
        mouseFollowTooltips
        voronoiDimension="x"
        voronoiPadding={getPadding()}
      />
    );
  }, [getPadding, intl]);

  // Returns onMouseOver, onMouseOut, and onClick events for the interactive legend
  const getEvents = () => {
    const result = getInteractiveLegendEvents({
      chartNames: getChartNames(),
      isHidden: index => isSeriesHidden(hiddenSeries, index),
      legendName: `${name}-legend`,
      onLegendClick: props => handleOnLegendClick(props.index),
    });
    return result;
  };

  const getHeight = () => {
    return baseHeight + extraHeight;
  };

  const getLegend = () => {
    return (
      <ChartLegend
        data={getLegendData(series, hiddenSeries)}
        height={25}
        gutter={20}
        name={`${name}-legend`}
        responsive={false}
      />
    );
  };

  const handleLegendAllowWrap = (value: number) => {
    if (value !== extraHeight) {
      setExtraHeight(value);
    }
  };

  const handleOnResize = useCallback(() => {
    const { clientWidth = 0 } = containerRef.current || {};

    if (clientWidth !== width) {
      setWidth(clientWidth);
    }
  }, [containerRef, width]);

  const initDatum = useCallback(() => {
    // Show all legends, regardless of data size

    const newSeries: ChartSeries[] = [];
    if (requestData && requestData.length) {
      newSeries.push({
        childName: 'request',
        data: requestData,
        legendItem: {
          name: getDateRangeString(
            requestData,
            messages.recommendedRequest,
            true,
          ),
          symbol: {
            fill: chartStyles.requestColorScale[0],
            type: 'square',
          },
          tooltip: intl.formatMessage(messages.request),
        },
        style: {
          data: {
            ...chartStyles.request,
            stroke: chartStyles.requestColorScale[0],
          },
        },
      });
    }
    if (limitData && limitData.length) {
      newSeries.push({
        childName: 'limit',
        data: limitData,
        legendItem: {
          name: getDateRangeString(limitData, messages.recommendedLimit, true),
          symbol: {
            fill: chartStyles.limitColorScale[0],
            type: 'square',
          },
          tooltip: intl.formatMessage(messages.limit),
        },
        style: {
          data: {
            ...chartStyles.limit,
            stroke: chartStyles.limitColorScale[0],
          },
        },
      });
    }
    if (usageData && usageData.length) {
      const boxPlotData: any[] = [];
      usageData.map((datum: any) => {
        if (datum.y.every((val: any, _i: any, arr: any[]) => val === arr[0])) {
          boxPlotData.push({
            ...datum,
            yVal: datum.y[0],
            y: [null],
          });
        } else {
          boxPlotData.push(datum);
        }
      });
      newSeries.push({
        childName: 'usage',
        data: boxPlotData as any,
        legendItem: {
          name: getDateRangeString(usageData, messages.actualUsage),
          symbol: {
            fill: chartStyles.usageColorScale[1],
            type: 'square',
          },
          tooltip: intl.formatMessage(messages.usage),
        },
        style: {
          median: {
            stroke: chartStyles.usageColorScale[0],
          },
          q1: {
            fill: chartStyles.usageColorScale[1],
          },
          q3: {
            fill: chartStyles.usageColorScale[1],
          },
        } as any,
      });

      // Show dots in place of box plot when all values are equal
      const scatterData: any[] = [];
      usageData.map((datum: any) => {
        if (datum.y.every((val: any, _i: any, arr: any[]) => val === arr[0])) {
          scatterData.push({
            ...datum,
            y: datum.y[0],
          });
        } else {
          scatterData.push({
            ...datum,
            y: null,
          });
        }
      });
      newSeries.push({
        childName: 'scatter',
        data: scatterData as any,
        style: {
          data: { fill: chartStyles.usageColorScale[1] },
        } as any,
      });
    }
    setSeries(newSeries);
    setCursorVoronoiContainer(getCursorVoronoiContainer());
    setHiddenSeries(new Set());
  }, [getCursorVoronoiContainer, intl, limitData, requestData, usageData]);

  useMemo(() => {
    initDatum();
  }, [initDatum]);

  useEffect(() => {
    const unobserve = getResizeObserver(containerRef.current, handleOnResize);
    return () => {
      if (unobserve) {
        unobserve();
      }
    };
  }, [containerRef, handleOnResize]);

  const chartHeight = getHeight();

  return (
    <div className={classes.chartOverride} ref={containerRef}>
      <div style={{ height: chartHeight }}>
        <Chart
          containerComponent={cloneContainer()}
          domain={getDomain(series, hiddenSeries, 1)}
          domainPadding={{ x: [30, 30] }}
          events={getEvents()}
          height={chartHeight}
          legendAllowWrap={handleLegendAllowWrap}
          legendComponent={getLegend()}
          legendPosition="bottom"
          name={name}
          padding={getPadding()}
          theme={ChartTheme}
          width={width}
        >
          <ChartAxis fixLabelOverlap />
          <ChartAxis dependentAxis showGrid />
          {getRequestChart()}
          {getLimitChart()}
          {getScatterChart()}
          {getUsageChart()}
        </Chart>
      </div>
    </div>
  );
};

export { OptimizationsBreakdownChart };
