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
  ChartModel,
  LineInfo,
  Overlay,
  RawOrBucket,
  RichDataPoint,
  VCLines,
} from '@backstage-community/plugin-kiali-common/types';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Icon,
} from '@patternfly/react-core';
import { default as React } from 'react';
import { PFColors } from '@backstage-community/plugin-kiali-common/styles';
import { KialiIcon } from '../../config/KialiIcon';
import { kialiStyle } from '../../styles/StyleUtils';
import {
  ChartWithLegend,
  LEGEND_HEIGHT,
  MIN_HEIGHT,
  MIN_HEIGHT_YAXIS,
} from './ChartWithLegend';
import { BrushHandlers } from './Container';

type KChartProps<T extends LineInfo> = {
  chart: ChartModel;
  chartHeight?: number;
  data: VCLines<RichDataPoint>;
  isMaximized: boolean;
  onToggleMaximized: () => void;
  onClick?: (datum: RawOrBucket<T>) => void;
  showSpans: boolean;
  showTrendline?: boolean;
  brushHandlers?: BrushHandlers;
  overlay?: Overlay<T>;
  timeWindow?: [Date, Date];
};

export const maximizeButtonStyle: React.CSSProperties = {
  position: 'relative',
  float: 'right',
};

const emptyStyle = kialiStyle({
  padding: '0 0 0 0',
  margin: '0 0 0 0',
});

const kchartStyle = kialiStyle({
  paddingTop: 15,
  paddingLeft: 25,
  paddingRight: 25,
  paddingBottom: 12,
});

// 24px (title + toolbar) + 20px (margin) + 15px (padding) + 15px (padding)
const titlePadding = 64;

type State = {
  collapsed: boolean;
};

type ChartTypeData = {
  // Previously used to tune Victory/PatternFly rendering. Kept for compatibility but no longer used.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seriesComponent: React.ReactElement<any>;
};

const lineInfo: ChartTypeData = {
  seriesComponent: <></>,
};
const areaInfo: ChartTypeData = {
  seriesComponent: <></>,
};
const barInfo: ChartTypeData = {
  seriesComponent: <></>,
};
const scatterInfo: ChartTypeData = {
  seriesComponent: <></>,
};

export class KChart<T extends LineInfo> extends React.Component<
  KChartProps<T>,
  State
> {
  constructor(props: KChartProps<T>) {
    super(props);
    this.state = {
      collapsed:
        this.props.chart.startCollapsed ||
        (!this.props.chart.error && this.isEmpty()),
    };
  }

  componentDidUpdate(prevProps: KChartProps<T>) {
    // Check when there is a change on empty datapoints on a refresh to draw the chart collapsed the first time
    // User can change the state after that point
    const propsIsEmpty = !this.props.data.some(s => s.datapoints.length !== 0);
    const prevPropsIsEmpty = !prevProps.data.some(
      s => s.datapoints.length !== 0,
    );
    if (propsIsEmpty !== prevPropsIsEmpty) {
      this.setState({
        collapsed: propsIsEmpty,
      });
    }
  }

  private getInnerChartHeight = (): number => {
    const chartHeight: number = this.props.chartHeight || 300;
    const innerChartHeight = chartHeight - titlePadding;
    return innerChartHeight;
  };

  private determineChartType() {
    if (this.props.chart.chartType === undefined) {
      if (this.props.chart.xAxis === 'series') {
        return barInfo;
      } else if (this.props.data.some(m => m.datapoints.some(dp => dp.y0))) {
        return areaInfo;
      }
      return lineInfo;
    }
    const chartType = this.props.chart.chartType;
    switch (chartType) {
      case 'area':
        return areaInfo;
      case 'bar':
        return barInfo;
      case 'scatter':
        return scatterInfo;
      case 'line':
      default:
        return lineInfo;
    }
  }

  private isEmpty(): boolean {
    return !this.props.data.some(s => s.datapoints.length !== 0);
  }

  private renderChart() {
    if (this.state.collapsed) {
      return undefined;
    }
    const typeData = this.determineChartType();
    const minDomain =
      this.props.chart.min === undefined
        ? undefined
        : { y: this.props.chart.min };
    const maxDomain =
      this.props.chart.max === undefined
        ? undefined
        : { y: this.props.chart.max };
    return (
      <ChartWithLegend
        chartHeight={this.getInnerChartHeight()}
        data={this.props.data}
        seriesComponent={typeData.seriesComponent}
        unit={this.props.chart.unit}
        isMaximized={this.props.isMaximized}
        moreChartProps={{ minDomain: minDomain, maxDomain: maxDomain }}
        onClick={this.props.onClick}
        timeWindow={this.props.timeWindow}
        xAxis={this.props.chart.xAxis}
      />
    );
  }

  private renderEmpty() {
    const chartHeight = this.getInnerChartHeight();
    return chartHeight > MIN_HEIGHT ? (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          height:
            chartHeight > MIN_HEIGHT_YAXIS
              ? chartHeight - LEGEND_HEIGHT
              : chartHeight,
          textAlign: 'center',
          borderLeft: `2px solid ${PFColors.ColorLight200}`,
          borderBottom: `2px solid ${PFColors.ColorLight200}`,
        }}
      >
        <EmptyState variant={EmptyStateVariant.sm} className={emptyStyle}>
          {this.props.isMaximized && (
            <Icon>
              <ViewInArIcon />
            </Icon>
          )}
          <EmptyStateBody className={emptyStyle}>
            No data available
          </EmptyStateBody>
        </EmptyState>
      </div>
    ) : undefined;
  }

  private renderError() {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          height: this.getInnerChartHeight(),
          textAlign: 'center',
        }}
      >
        <EmptyState variant={EmptyStateVariant.sm} className={emptyStyle}>
          {this.props.isMaximized && (
            <Icon>
              <ErrorOutlineIcon
                style={{ color: PFColors.Danger, width: 32, height: 32 }}
              />
            </Icon>
          )}
          <EmptyStateBody className={emptyStyle}>
            An error occured while fetching this metric:
            <p>
              <i>{this.props.chart.error}</i>
            </p>
          </EmptyStateBody>
        </EmptyState>
      </div>
    );
  }
  render() {
    // eslint-disable-next-line no-nested-ternary
    const renderE = this.props.chart.error
      ? this.renderError()
      : this.isEmpty()
        ? this.renderEmpty()
        : this.renderChart();
    return (
      <div className={kchartStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              minWidth: '0px',
              display: 'inline-block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {this.props.chart.name}
          </div>
          {this.props.onToggleMaximized && (
            <div style={maximizeButtonStyle}>
              <Button
                variant={ButtonVariant.link}
                onClick={this.props.onToggleMaximized}
                isInline
              >
                <KialiIcon.Expand />
              </Button>
            </div>
          )}
        </div>
        <div style={{ marginTop: 20 }} data-test="metrics-chart">
          {renderE}
        </div>
      </div>
    );
  }
}
