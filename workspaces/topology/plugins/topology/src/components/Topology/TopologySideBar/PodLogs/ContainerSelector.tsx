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
import type { MouseEvent, Ref } from 'react';

import { useState } from 'react';

import { V1Container } from '@kubernetes/client-node';
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import styles from './ContainerSelector.module.css';

type ContainerSelectorType = {
  containersList: V1Container[];
  containerSelected: string;
  onContainerChange: (containerName: string) => void;
};

export const ContainerSelector = ({
  containersList,
  containerSelected,
  onContainerChange,
}: ContainerSelectorType) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (
    _event: MouseEvent | undefined,
    selection: string | number | undefined,
  ) => {
    if (typeof selection === 'string') {
      onContainerChange(selection);
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.containerSelector} data-testid="container-select">
      <Select
        aria-label="Container"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={onSelect}
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            isExpanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            className={styles.containerToggle}
          >
            {containerSelected || 'Container'}
          </MenuToggle>
        )}
      >
        <SelectList>
          {containersList.map(container => (
            <SelectOption
              key={container.name}
              value={container.name}
              isSelected={container.name === containerSelected}
            >
              {container.name}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </div>
  );
};
