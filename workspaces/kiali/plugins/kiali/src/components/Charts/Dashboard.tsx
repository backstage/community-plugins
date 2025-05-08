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
  AllPromLabelsValues,
  ChartModel,
  DashboardModel,
  LineInfo,
  Overlay,
  RawOrBucket,
} from '@backstage-community/plugin-kiali-common/types';
import { Grid } from '@material-ui/core';
import { ChartThemeColor, getTheme } from '@patternfly/react-charts';
import { isArray } from 'lodash';
import { default as React } from 'react';
import { getDataSupplier } from '../../utils/VictoryChartsUtils';
import { BrushHandlers } from './Container';
import { KChart } from './KChart';

export type Props<T extends LineInfo> = {
  colors?: string[];
  dashboard: DashboardModel;
  maximizedChart?: string;
  expandHandler: (expandedChart?: string) => void;
  labelValues: AllPromLabelsValues;
  labelPrettifier?: (key: string, value: string) => string;
  onClick?: (chart: ChartModel, datum: RawOrBucket<T>) => void;
  brushHandlers?: BrushHandlers;
  template?: string;
  dashboardHeight: number;
  showSpans: boolean;
  showTrendlines?: boolean;
  customMetric?: boolean;
  overlay?: Overlay<T>;
  timeWindow?: [Date, Date];
};

type State = {
  maximizedChart?: string;
};

export class Dashboard<T extends LineInfo> extends React.Component<
  Props<T>,
  State
> {
  constructor(props: Props<T>) {
    super(props);
    this.state = {
      maximizedChart: props.maximizedChart,
    };
  }

  private onToggleMaximized = (chartKey: string): void => {
    const maximized = this.state.maximizedChart ? undefined : chartKey;
    this.setState(prevState => ({
      maximizedChart: prevState.maximizedChart ? undefined : chartKey,
    }));
    this.props.expandHandler(maximized);
  };

  private getChartHeight = (): number => {
    if (this.state.maximizedChart) {
      return this.props.dashboardHeight;
    }
    // Dashboards define the rows that are used
    // Columns are defined using the spans field in the charts definition using a flex strategy
    // When columns span the grid (12 spans) charts move to the next row
    // By default metrics use a 2 row layout
    const rows = this.props.dashboard.rows > 0 ? this.props.dashboard.rows : 2;
    return this.props.dashboardHeight / rows;
  };

  private renderChart(chart: ChartModel) {
    let colorScale =
      this.props.colors || getTheme(ChartThemeColor.multi).chart!.colorScale!;
    if (!isArray(colorScale)) {
      colorScale = [colorScale];
    }
    const dataSupplier = getDataSupplier(
      chart,
      {
        values: this.props.labelValues,
        prettifier: this.props.labelPrettifier,
      },
      colorScale as string[],
    );
    let onClick: ((datum: RawOrBucket<T>) => void) | undefined = undefined;
    if (this.props.onClick) {
      onClick = (datum: RawOrBucket<T>) => this.props.onClick!(chart, datum);
    }
    return (
      <KChart
        key={chart.name}
        chartHeight={this.getChartHeight()}
        chart={chart}
        showSpans={this.props.showSpans}
        showTrendline={this.props.showTrendlines}
        data={dataSupplier()}
        onToggleMaximized={() => this.onToggleMaximized(chart.name)}
        isMaximized={this.state.maximizedChart !== undefined}
        overlay={chart.xAxis === 'series' ? undefined : this.props.overlay}
        onClick={onClick}
        brushHandlers={this.props.brushHandlers}
        timeWindow={this.props.timeWindow}
      />
    );
  }

  render() {
    if (this.state.maximizedChart) {
      const chart = this.props.dashboard.charts.find(
        c => c.name === this.state.maximizedChart,
      );
      if (chart) {
        return this.renderChart(chart);
      }
    }

    return (
      <Grid container spacing={2}>
        {this.props.dashboard.charts.map(c => {
          return <Grid xs={3}>{this.renderChart(c)}</Grid>;
        })}
      </Grid>
    );
  }
}
