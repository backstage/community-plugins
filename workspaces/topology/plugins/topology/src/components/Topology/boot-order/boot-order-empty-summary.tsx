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

import { useState, useCallback } from 'react';

import {
  ExpandableSection,
  Content,
  ContentVariants,
} from '@patternfly/react-core';

import { BootableDeviceType } from '../../../types/vm';
import { deviceKey, deviceLabel } from '../../../utils/vm-utils';

import './boot-order.css';

export const BootOrderEmptySummary: FC<BootOrderEmptySummaryProps> = ({
  devices,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const options = devices.filter(device => !device.value.bootOrder);
  const onToggle = useCallback(() => setIsExpanded(!isExpanded), [isExpanded]);

  // Note(Yaacov):
  // className='text-secondary' is a hack to fix TextVariants being overriden.
  // Using <ol> because '@patternfly/react-core' <List> currently miss isOrder parameter.
  return (
    <>
      <Content
        component={ContentVariants.p}
        className="kubevirt-boot-order-summary__empty-text"
      >
        No resource selected
      </Content>
      <Content component={ContentVariants.small} className="text-secondary">
        VM will attempt to boot from disks by order of apearance in YAML file
      </Content>
      {options.length > 0 && (
        <ExpandableSection
          toggleText={
            isExpanded ? 'Hide default boot disks' : 'Show default boot disks'
          }
          onToggle={onToggle}
          isExpanded={isExpanded}
          className="kubevirt-boot-order-summary__expandable"
        >
          <ol className="kubevirt-boot-order-summary__ol">
            {options.map(option => (
              <li key={deviceKey(option)}>{deviceLabel(option)}</li>
            ))}
          </ol>
        </ExpandableSection>
      )}
    </>
  );
};

export type BootOrderEmptySummaryProps = {
  devices: BootableDeviceType[];
};
