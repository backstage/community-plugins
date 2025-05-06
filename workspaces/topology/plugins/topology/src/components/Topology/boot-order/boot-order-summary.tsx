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
import type { FC } from 'react';

import * as _ from 'lodash';

import { BootableDeviceType } from '../../../types/vm';
import { deviceKey, deviceLabel } from '../../../utils/vm-utils';
import { BootOrderEmptySummary } from './boot-order-empty-summary';

// NOTE(yaacov): using <ol> because '@patternfly/react-core' <List> currently miss isOrder parameter.
export const BootOrderSummary: FC<BootOrderSummaryProps> = ({ devices }) => {
  const sources = _.sortBy(
    devices.filter(device => device.value.bootOrder),
    'value.bootOrder',
  );

  return (
    <>
      {sources.length === 0 ? (
        <BootOrderEmptySummary devices={devices} />
      ) : (
        <ol>
          {sources.map((source: any) => (
            <li key={deviceKey(source)}>{deviceLabel(source)}</li>
          ))}
        </ol>
      )}
    </>
  );
};

export type BootOrderSummaryProps = {
  devices: BootableDeviceType[];
};
