/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type {
  RichDataPoint,
  VCDataPoint,
  VCLines,
} from '@backstage-community/plugin-kiali-common/types';
import { useTheme } from '@material-ui/core/styles';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLabel,
  ChartLegend,
  ChartProps,
  ChartScatter,
  ChartThreshold,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { default as React } from 'react';
import { addLegendEvent, VCEvent } from '../../utils/VictoryEvents';
import { PFColors } from '../Pf/PfColors';
import { CustomTooltip } from './CustomTooltip';

type Props = ChartProps & {
  labelName: string;
  name: string;
  series: VCLines<RichDataPoint>;
  showLegend?: boolean;
  showXAxisValues?: boolean;
  showYAxis?: boolean;
  tooltipFormat?: (dp: VCDataPoint) => string;
  thresholds?: VCLines<RichDataPoint>;
};

export const INTERPOLATION_STRATEGY = 'monotoneX';

export const SparklineChart = (props: Props) => {
  const [width, setWidth] = React.useState<number>(props.width || 1);
  const [hiddenSeries, setHiddenSeries] = React.useState<Set<number>>(
    new Set(),
  );
  const containerRef: React.RefObject<HTMLDivElement> | undefined =
    props.width === undefined ? React.createRef<HTMLDivElement>() : undefined;
  const theme = useTheme();
  const axisStyle = {
    tickLabels: { fill: theme.palette.type === 'dark' ? '#dcdcdc' : '#000' },
  };
  const labelStyle = {
    fill: theme.palette.type === 'dark' ? '#dcdcdc' : '#000',
  };

  const handleResize = () => {
    if (containerRef?.current) {
      setWidth(containerRef.current.clientWidth);
    }
  };

  React.useEffect(() => {
    if (containerRef) {
      setTimeout(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
      });

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
    return () => {};
  });

  const renderChart = () => {
    const legendHeight = 30;
    let height = props.height || 300;
    let padding = { top: 0, bottom: 0, left: 0, right: 0 };
    if (props.padding) {
      const p = props.padding as number;
      if (Number.isFinite(p)) {
        padding = { top: p, bottom: p, left: p, right: p };
      } else {
        padding = { ...padding, ...(props.padding as object) };
      }
    }
    const events: VCEvent[] = [];
    if (props.showLegend) {
      padding.bottom += legendHeight;
      height += legendHeight;
      props.series.forEach((_, idx) => {
        addLegendEvent(events, {
          legendName: `${props.name}-legend`,
          idx: idx,
          serieID: [`${props.name}-area-${idx}`],
          onClick: () => {
            if (!hiddenSeries.delete(idx)) {
              // Was not already hidden => add to set
              hiddenSeries.add(idx);
            }
            setHiddenSeries(new Set(hiddenSeries));
            return null;
          },
          onMouseOver: prs => {
            return {
              style: { ...prs.style, strokeWidth: 4, fillOpacity: 0.5 },
            };
          },
        });
      });
    }

    const container = (
      <ChartVoronoiContainer
        labels={obj =>
          props.tooltipFormat ? props.tooltipFormat(obj.datum) : obj.datum.y
        }
        labelComponent={<CustomTooltip />}
        voronoiBlacklist={props.series.map(
          (_, idx) => `${props.name}-scatter-${idx}`,
        )}
      />
    );
    const hiddenAxisStyle = {
      axis: { stroke: 'none' },
      ticks: { stroke: 'none' },
      tickLabels: { stroke: 'none', fill: 'none' },
    };

    return (
      <Chart
        {...props}
        height={height}
        width={width}
        padding={padding}
        events={events as any[]}
        containerComponent={container}
        // Hack: 1 pxl on Y domain padding to prevent harsh clipping (https://github.com/kiali/kiali/issues/2069)
        domainPadding={{ y: 1 }}
      >
        {props.showXAxisValues ? (
          <ChartAxis
            tickValues={props.series[0].datapoints.map(dp => dp.x)}
            tickFormat={x =>
              (x as Date).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            }
            tickCount={2}
            style={axisStyle}
          />
        ) : (
          <ChartAxis tickCount={15} style={hiddenAxisStyle} />
        )}
        {props.showYAxis ? (
          <ChartAxis
            label={props.labelName}
            axisLabelComponent={
              <ChartLabel
                y={-5}
                x={15}
                angle={0}
                renderInPortal
                style={labelStyle}
              />
            }
            tickCount={2}
            dependentAxis
            style={axisStyle}
          />
        ) : (
          <ChartAxis dependentAxis style={hiddenAxisStyle} />
        )}
        {props.series.map((serie, idx) => {
          if (hiddenSeries.has(idx)) {
            return undefined;
          }
          return (
            <ChartScatter
              name={`${props.name}-scatter-${idx}`}
              key={`${props.name}-scatter-${idx}`}
              data={serie.datapoints}
              style={{ data: { fill: serie.color } }}
              size={({ active }) => (active ? 5 : 2)}
            />
          );
        })}
        {props.series.map((serie, idx) => {
          if (hiddenSeries.has(idx)) {
            return undefined;
          }
          return (
            <ChartArea
              name={`${props.name}-area-${idx}`}
              key={`${props.name}-area-${idx}`}
              data={serie.datapoints}
              style={{
                data: {
                  fill: serie.color,
                  fillOpacity: 0.2,
                  stroke: serie.color,
                  strokeWidth: 2,
                },
              }}
              interpolation={INTERPOLATION_STRATEGY}
            />
          );
        })}
        {props.showLegend && (
          <ChartLegend
            name={`${props.name}-legend`}
            data={props.series.map((s, idx) => {
              if (hiddenSeries.has(idx)) {
                return { ...s.legendItem, symbol: { fill: PFColors.Color200 } };
              }
              return s.legendItem;
            })}
            y={height - legendHeight}
            height={legendHeight}
            width={width}
          />
        )}

        {props.thresholds &&
          props.thresholds.map((serie, idx) => {
            if (hiddenSeries.has(idx)) {
              return undefined;
            }
            return (
              <ChartThreshold
                data={serie.datapoints}
                style={{
                  data: { stroke: serie.color },
                }}
              />
            );
          })}
      </Chart>
    );
  };

  if (containerRef) {
    return <div ref={containerRef}>{renderChart()}</div>;
  }
  return renderChart();
};
