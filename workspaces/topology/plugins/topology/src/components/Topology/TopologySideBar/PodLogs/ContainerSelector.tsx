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
import type { ReactNode } from 'react';

import { V1Container } from '@kubernetes/client-node';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import ResourceName from '../../../common/ResourceName';

type ContainerSelectorType = {
  containersList: V1Container[];
  containerSelected: string;
  onContainerChange: (event: SelectChangeEvent, child: ReactNode) => void;
};

export const ContainerSelector = ({
  containersList,
  containerSelected,
  onContainerChange,
}: ContainerSelectorType) => {
  return (
    <Select
      onChange={onContainerChange}
      label="Container"
      style={{ marginLeft: '20px' }}
      value={containerSelected}
      data-testid="container-select"
    >
      {containersList.map(container => {
        return (
          <MenuItem value={container.name} key={container.name}>
            <ResourceName name={container.name} kind="Container" />
          </MenuItem>
        );
      })}
    </Select>
  );
};
