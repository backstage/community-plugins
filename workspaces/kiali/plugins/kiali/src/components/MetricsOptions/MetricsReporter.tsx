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
  Direction,
  Reporter,
} from '@backstage-community/plugin-kiali-common/types';
import { Tooltip } from '@material-ui/core';
import { default as React } from 'react';
import { HistoryManager, URLParam } from '../../app/History';
import { KialiIcon } from '../../config/KialiIcon';
import { kialiStyle } from '../../styles/StyleUtils';
import { ToolbarDropdown } from '../ToolbarDropdown/ToolbarDropdown';

interface Props {
  onChanged: (reproter: Reporter) => void;
  direction: Direction;
  reporter: Reporter;
}

const infoStyle = kialiStyle({
  margin: '0px 5px 2px 5px',
});

export class MetricsReporter extends React.Component<Props> {
  static ReporterOptions: { [key: string]: string } = {
    destination: 'Destination',
    source: 'Source',
    both: 'Both',
  };

  static initialReporter = (direction: Direction): Reporter => {
    const reporterParam = HistoryManager.getParam(URLParam.REPORTER);
    if (reporterParam !== undefined) {
      return reporterParam as Reporter;
    }
    return direction === 'inbound' ? 'destination' : 'source';
  };

  reportTooltip = (
    <div>
      <ul style={{ listStyleType: 'none' }}>
        <li>
          <div style={{ display: 'inline-block' }}>
            Select the reporter for the metrics displayed. Each Istio metric can
            be reported by the Source (workload which emitted the request) and
            by the Destination (workload which received the request). In
            general, the timeseries will look exactly the same because Source
            and Destination report the same data.
          </div>
        </li>
        <li>
          <div style={{ display: 'inline-block' }}>
            There are some exceptions:
          </div>
        </li>
        <li>
          <ul style={{ listStyleType: 'circle', marginLeft: '20px' }}>
            <li>
              An opened circuit breaker would cause networking failures only
              reported by the Source
            </li>
            <li>Fault-injected failures only reported by the Source</li>
            <li>
              Traffic coming from unknown sources (anything that is not under
              the Istio mesh) would only be reported by the Destination
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );

  onReporterChanged = (reporter: string) => {
    HistoryManager.setParam(URLParam.REPORTER, reporter);
    const newReporter = reporter as Reporter;
    this.props.onChanged(newReporter);
  };

  render() {
    return (
      <span>
        <ToolbarDropdown
          id="metrics_filter_reporter"
          disabled={false}
          handleSelect={this.onReporterChanged}
          nameDropdown="Reported from"
          value={this.props.reporter}
          label={MetricsReporter.ReporterOptions[this.props.reporter]}
          options={MetricsReporter.ReporterOptions}
        />
        <Tooltip
          title={<div style={{ textAlign: 'left' }}>{this.reportTooltip}</div>}
        >
          <KialiIcon.Info className={infoStyle} />
        </Tooltip>
      </span>
    );
  }
}
