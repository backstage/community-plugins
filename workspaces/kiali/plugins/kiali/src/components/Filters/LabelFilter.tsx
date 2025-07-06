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
  Button,
  ButtonVariant,
  Popover,
  PopoverPosition,
  TextInput,
} from '@patternfly/react-core';
import { default as React } from 'react';
import { KialiIcon } from '../../config/KialiIcon';
import { kialiStyle } from '../../styles/StyleUtils';

interface LabelFiltersProps {
  filterAdd: (value: string) => void;
  isActive: (value: string) => boolean;
  onChange: (value: any) => void;
  value: string;
}

const infoIconStyle = kialiStyle({
  marginLeft: '0.5rem',
  alignSelf: 'center',
});

export const LabelFilters: React.FC<LabelFiltersProps> = (
  props: LabelFiltersProps,
) => {
  const onkeyPress = (e: any) => {
    if (e.key === 'Enter') {
      if (props.value?.length > 0) {
        props.value
          .split(' ')
          .forEach(val => !props.isActive(val) && props.filterAdd(val));
      }
    }
  };

  return (
    <>
      <TextInput
        type="text"
        value={props.value}
        aria-label="filter_input_label_key"
        placeholder="Set Label"
        onChange={(_event, value) => props.onChange(value)}
        onKeyPress={e => onkeyPress(e)}
        style={{ width: 'auto' }}
      />
      <Popover
        headerContent={<span>Label Filter Help</span>}
        position={PopoverPosition.right}
        bodyContent={
          <>
            To set a label filter you must enter values like.
            <br />
            <ul style={{ listStyleType: 'circle', marginLeft: '20px' }}>
              <li>Filter by label presence: label</li>
              <li>Filter by label and value: label=value</li>
              <li>
                Filter by more than one label and one or more values:
                <br />
                label=value label2=value2,value2-2
                <br />
                (separate with ' ')
              </li>
            </ul>
          </>
        }
      >
        <Button variant={ButtonVariant.link} className={infoIconStyle} isInline>
          <KialiIcon.Help />
        </Button>
      </Popover>
    </>
  );
};
