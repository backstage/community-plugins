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
import { Select } from '@backstage/core-components';
import { default as React } from 'react';
import { HistoryManager, URLParam } from '../../app/History';
import { getDurationType } from '../../pages/Overview/OverviewToolbar';

type TimeControlsProps = {
  disabled: boolean;
  id: string;
  duration: string;
  label: string;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  supportsReplay?: boolean;
};

export const TimeDurationComponent: React.FC<TimeControlsProps> = (
  props: TimeControlsProps,
) => {
  const updateDurationType = (duration: number) => {
    HistoryManager.setParam(URLParam.DURATION, duration.toString());
    props.setDuration(duration);
  };

  return (
    <Select
      onChange={e => updateDurationType(e as number)}
      label={props.label}
      items={getDurationType()}
      selected={props.duration.toString()}
    />
  );
};
