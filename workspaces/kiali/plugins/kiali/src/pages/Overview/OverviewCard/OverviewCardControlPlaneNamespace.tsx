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
import {
  Datapoint,
  DurationInSeconds,
  IstiodResourceThresholds,
  Metric,
  RichDataPoint,
  VCLine,
} from '@backstage-community/plugin-kiali-common/types';
import { Card, CardContent, Grid, Tooltip } from '@material-ui/core';
import { default as React } from 'react';
import { SparklineChart } from '../../../components/Charts/SparklineChart';
import { PFColors } from '../../../components/Pf/PfColors';
import { KialiIcon } from '../../../config/KialiIcon';
import { kialiStyle } from '../../../styles/StyleUtils';
import { toLocaleStringWithConditionalDate } from '../../../utils/Date';
import { getName } from '../../../utils/RateIntervals';
import { toVCLine } from '../../../utils/VictoryChartsUtils';

export const infoStyle = kialiStyle({
  margin: '0px 0px -1px 4px',
});

const controlPlaneAnnotation = 'topology.istio.io/controlPlaneClusters';

type ControlPlaneProps = {
  pilotLatency?: Metric[];
  istiodContainerMemory?: Metric[];
  istiodContainerCpu?: Metric[];
  istiodProcessMemory?: Metric[];
  istiodProcessCpu?: Metric[];
  duration: DurationInSeconds;
  istiodResourceThresholds?: IstiodResourceThresholds;
};

export function isRemoteCluster(annotations?: {
  [key: string]: string;
}): boolean {
  if (annotations && annotations[controlPlaneAnnotation]) {
    return true;
  }
  return false;
}

function showMetrics(metrics: Metric[] | undefined): boolean {
  // show metrics if metrics exists and some values at least are not zero
  if (
    metrics &&
    metrics.length > 0 &&
    metrics[0].datapoints.length > 0 &&
    metrics[0].datapoints.some(dp => Number(dp[1]) !== 0)
  ) {
    return true;
  }

  return false;
}

export class OverviewCardControlPlaneNamespace extends React.Component<
  ControlPlaneProps,
  {}
> {
  render() {
    const memorySeries: VCLine<RichDataPoint>[] = [];
    const cpuSeries: VCLine<RichDataPoint>[] = [];
    const memoryThresholds: VCLine<RichDataPoint>[] = [];
    const cpuThresholds: VCLine<RichDataPoint>[] = [];

    // The CPU metric can be respresented by a container or a process metric. We need to check which one to use
    let cpuMetricSource = 'container';
    let cpu = this.props.istiodContainerCpu;
    if (!showMetrics(this.props.istiodContainerCpu)) {
      cpu = this.props.istiodProcessCpu;
      cpuMetricSource = 'process';
    }

    // The memory metric can be respresented by a container or a process metric. We need to check which one to use
    let memoryMetricSource = 'process';
    let memory = this.props.istiodContainerMemory;
    if (!showMetrics(this.props.istiodContainerMemory)) {
      memory = this.props.istiodProcessMemory;
      memoryMetricSource = 'container';
    }

    if (showMetrics(memory)) {
      if (memory && memory?.length > 0) {
        const data = toVCLine(memory[0].datapoints, 'Mb', PFColors.Green400);

        if (this.props.istiodResourceThresholds?.memory) {
          const datapoint0: Datapoint = [
            memory[0].datapoints[0][0],
            memory[0].datapoints[0][1],
          ];
          datapoint0[1] = this.props.istiodResourceThresholds?.memory;
          const datapointn: Datapoint = [
            memory[0].datapoints[memory[0].datapoints.length - 1][0],
            memory[0].datapoints[memory[0].datapoints.length - 1][0],
          ];
          datapointn[1] = this.props.istiodResourceThresholds?.memory;
          const dataThre = toVCLine(
            [datapoint0, datapointn],
            'Mb (Threshold)',
            PFColors.Green300,
          );
          memoryThresholds.push(dataThre);
        }

        memorySeries.push(data);
      }
    }

    if (showMetrics(cpu)) {
      if (cpu && cpu?.length > 0) {
        const data = toVCLine(cpu[0].datapoints, 'cores', PFColors.Green400);

        if (this.props.istiodResourceThresholds?.cpu) {
          const datapoint0: Datapoint = [
            cpu[0].datapoints[0][0],
            cpu[0].datapoints[0][1],
          ];
          datapoint0[1] = this.props.istiodResourceThresholds?.cpu;
          const datapointn: Datapoint = [
            cpu[0].datapoints[cpu[0].datapoints.length - 1][0],
            cpu[0].datapoints[cpu[0].datapoints.length - 1][0],
          ];
          datapointn[1] = this.props.istiodResourceThresholds?.cpu;
          const dataThre = toVCLine(
            [datapoint0, datapointn],
            'cores',
            PFColors.Green300,
          );
          cpuThresholds.push(dataThre);
        }

        cpuSeries.push(data);
      }
    }
    return (
      <div style={{ textAlign: 'center' }}>
        <div>
          <div
            style={{
              display: 'inline-block',
              width: '125px',
              whiteSpace: 'nowrap',
            }}
          >
            Control plane metrics
          </div>
        </div>
        <div
          style={{
            width: '100%',
            verticalAlign: 'top',
          }}
        >
          <Card>
            <CardContent>
              {showMetrics(memory) && (
                <Grid
                  container
                  direction="row"
                  data-test="memory-chart"
                  style={{ marginBottom: 20 }}
                >
                  <Grid item md={2}>
                    <Grid
                      container
                      direction="column"
                      spacing={0}
                      style={{ textAlign: 'right', paddingRight: 30 }}
                    >
                      <Grid item>
                        <b>Memory</b>
                      </Grid>
                      <Grid item>
                        {getName(this.props.duration).toLocaleLowerCase(
                          'en-US',
                        )}
                        <Tooltip
                          placement="right"
                          title={
                            <div style={{ textAlign: 'left' }}>
                              This values represents the memory of the istiod{' '}
                              {memoryMetricSource}
                            </div>
                          }
                        >
                          <div style={{ display: 'inline' }}>
                            <KialiIcon.Info className={infoStyle} />
                          </div>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item md={10}>
                    <SparklineChart
                      ariaTitle="Memory"
                      name="memory"
                      height={85}
                      showLegend={false}
                      showYAxis
                      padding={{ top: 50, left: 70, right: 70, bottom: 0 }}
                      tooltipFormat={dp =>
                        `${toLocaleStringWithConditionalDate(
                          dp.x as Date,
                        )}\n${dp.y.toFixed(2)} ${dp.name}`
                      }
                      series={memorySeries}
                      labelName="mb"
                      thresholds={memoryThresholds}
                    />
                  </Grid>
                </Grid>
              )}
              {showMetrics(cpu) && (
                <Grid container direction="row" data-test="cpu-chart">
                  <Grid item md={2}>
                    <Grid
                      container
                      direction="column"
                      spacing={0}
                      style={{ textAlign: 'right', paddingRight: 30 }}
                    >
                      <Grid item>
                        <b>CPU</b>
                      </Grid>
                      <Grid item>
                        {getName(this.props.duration).toLocaleLowerCase(
                          'en-US',
                        )}
                        <Tooltip
                          placement="right"
                          title={
                            <div style={{ textAlign: 'left' }}>
                              This values represents cpu of the istiod{' '}
                              {cpuMetricSource}
                            </div>
                          }
                        >
                          <div style={{ display: 'inline' }}>
                            <KialiIcon.Info className={infoStyle} />
                          </div>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item md={10}>
                    <SparklineChart
                      name="cpu"
                      height={85}
                      showLegend={false}
                      showYAxis
                      showXAxisValues
                      padding={{ top: 50, left: 70, right: 70, bottom: 0 }}
                      tooltipFormat={dp =>
                        `${toLocaleStringWithConditionalDate(
                          dp.x as Date,
                        )}\n${dp.y.toFixed(2)} ${dp.name}`
                      }
                      series={cpuSeries}
                      labelName="cores"
                      thresholds={cpuThresholds}
                    />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}
