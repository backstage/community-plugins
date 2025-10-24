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
import { Select, SelectItem } from '@backstage/core-components';
import { default as React } from 'react';
import { HistoryManager, URLParam } from '../../app/History';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { serverConfig } from '../../config';

export enum OverviewDisplayMode {
  COMPACT,
  EXPAND,
  LIST,
}

const overviewTypes = {
  app: 'Apps',
  workload: 'Workloads',
  service: 'Services',
};

const directionTypes = {
  inbound: 'Inbound',
  outbound: 'Outbound',
};

export type OverviewType = keyof typeof overviewTypes;
export type DirectionType = keyof typeof directionTypes;

type OverviewToolbarProps = {
  onRefresh: () => void;
  overviewType: OverviewType;
  setOverviewType: React.Dispatch<React.SetStateAction<OverviewType>>;
  directionType: DirectionType;
  setDirectionType: React.Dispatch<React.SetStateAction<DirectionType>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
};

const healthTypeItems = Object.keys(overviewTypes).map(k => ({
  label: (overviewTypes as any)[k],
  value: k,
}));

const directionTypeItems = Object.keys(directionTypes).map(k => ({
  label: (directionTypes as any)[k],
  value: k,
}));

export const currentOverviewType = (): OverviewType => {
  const otype = HistoryManager.getParam(URLParam.OVERVIEW_TYPE);
  return (otype as OverviewType) || 'app';
};

export const currentDirectionType = (): DirectionType => {
  const drtype = HistoryManager.getParam(URLParam.DIRECTION_TYPE);
  return (drtype as DirectionType) || 'inbound';
};

export const getDurationType = (): SelectItem[] => {
  const items: SelectItem[] = [];

  // Add check for serverConfig
  if (!serverConfig || !serverConfig.durations) {
    // Return default durations if serverConfig is not available
    return [
      { label: 'Last 1m', value: '60' },
      { label: 'Last 5m', value: '300' },
      { label: 'Last 10m', value: '600' },
      { label: 'Last 30m', value: '1800' },
      { label: 'Last 1h', value: '3600' },
    ];
  }

  Object.entries(serverConfig.durations).forEach(([key, value]) =>
    items.push({
      label: `Last ${value}`,
      value: key,
    }),
  );
  return items;
};

export const OverviewToolbar = (props: OverviewToolbarProps) => {
  const updateOverviewType = (otype: String) => {
    const isOverviewType = (val: String): val is OverviewType =>
      val === 'app' || val === 'workload' || val === 'service';

    if (isOverviewType(otype)) {
      HistoryManager.setParam(URLParam.OVERVIEW_TYPE, otype);
      props.setOverviewType(otype);
    } else {
      throw new Error('Overview type is not valid.');
    }
  };

  const updateDirectionType = (dtype: String) => {
    const isDirectionType = (val: String): val is DirectionType =>
      val === 'inbound' || val === 'outbound';

    if (isDirectionType(dtype)) {
      HistoryManager.setParam(URLParam.DIRECTION_TYPE, dtype);
      props.setDirectionType(dtype);
    } else {
      throw new Error('Direction type is not valid.');
    }
  };

  const grids = () => {
    const elements = [];
    elements.push(
      <Select
        onChange={e => updateOverviewType(e as String)}
        label="Health for"
        items={healthTypeItems}
        selected={props.overviewType}
      />,
      <Select
        onChange={e => updateDirectionType(e as String)}
        label="Traffic"
        items={directionTypeItems}
        selected={props.directionType}
      />,
      <TimeDurationComponent
        key="DurationDropdown"
        id="workload-list-duration-dropdown"
        disabled={false}
        duration={props.duration.toString()}
        setDuration={props.setDuration}
        label="Metrics for"
      />,
    );
    return elements;
  };

  return (
    <DefaultSecondaryMasthead
      elements={grids()}
      onRefresh={() => props.onRefresh}
    />
  );
};
