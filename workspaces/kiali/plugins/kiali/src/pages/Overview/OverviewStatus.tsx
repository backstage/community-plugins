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
  ActiveFilter,
  DEFAULT_LABEL_OPERATION,
  DurationInSeconds,
  IntervalInMilliseconds,
  Status,
} from '@backstage-community/plugin-kiali-common/types';
import { Tooltip } from '@material-ui/core';
import { default as React } from 'react';
import { healthFilter } from '../../components/Filters/CommonFilters';
import { FilterSelected } from '../../components/Filters/StatefulFilters';
import { healthIndicatorStyle } from '../../components/Health/HealthStyle';
import { createIcon } from '../../components/Health/Helper';
import { Paths } from '../../config';

type Props = {
  id: string;
  namespace: string;
  status: Status;
  items: string[];
  targetPage: Paths;
  duration: DurationInSeconds;
  refreshInterval: IntervalInMilliseconds;
};

export class OverviewStatus extends React.Component<Props, {}> {
  setFilters = () => {
    const filters: ActiveFilter[] = [
      {
        category: healthFilter.category,
        value: this.props.status.name,
      },
    ];
    FilterSelected.setSelected({
      filters: filters,
      op: DEFAULT_LABEL_OPERATION,
    });
  };

  render() {
    const length = this.props.items.length;
    let items = this.props.items;
    if (items.length > 6) {
      items = items.slice(0, 5);
      items.push(`and ${length - items.length} more...`);
    }
    const tooltipContent = (
      <div data-test="overview-status">
        <strong data-test={`${this.props.status.name}-status`}>
          {this.props.status.name}
        </strong>
        {items.map((app, idx) => {
          return (
            <div
              data-test={`${this.props.id}-${app}`}
              key={`${this.props.id}-${idx}`}
            >
              <span style={{ marginRight: '10px' }}>
                {createIcon(this.props.status, 'sm')}
              </span>{' '}
              {app}
            </div>
          );
        })}
      </div>
    );

    return (
      <>
        <Tooltip
          aria-label="Overview status"
          placement="top"
          title={tooltipContent}
          className={healthIndicatorStyle}
        >
          <div style={{ display: 'inline-block', marginRight: '5px' }}>
            {createIcon(this.props.status)}
            {` ${length}`}
          </div>
        </Tooltip>
      </>
    );
  }
}
