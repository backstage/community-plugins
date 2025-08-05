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
import { MenuItem, Select, Tooltip } from '@material-ui/core';
import { default as React } from 'react';
import { kialiStyle } from '../../styles/StyleUtils';

const dropdownTitle = kialiStyle({
  marginRight: '10px',
  alignSelf: 'center',
});

type ToolbarDropdownProps = {
  className?: string;
  disabled?: boolean;
  id: string;
  label?: string;
  nameDropdown?: string;
  options: object;
  tooltip?: string;
  tooltipPosition?: string;
  value?: number | string;

  handleSelect: (value: string) => void;
  onToggle?: (isOpen: boolean) => void;
};

export const ToolbarDropdown: React.FC<ToolbarDropdownProps> = (
  props: ToolbarDropdownProps,
) => {
  const onKeyChanged = (_event: object, child?: React.ReactNode) => {
    if (child) {
      // @ts-ignore
      props.handleSelect(String(child.props.value));
    }
  };

  const dropdownButton = (
    <Select
      aria-label={props.id}
      value={props.value}
      id={props.id}
      data-test={props.id}
      aria-labelledby={props.id}
      onChange={onKeyChanged}
    >
      {Object.keys(props.options).map(key => {
        return (
          <MenuItem
            id={key}
            key={key}
            disabled={props.disabled}
            selected={key === String(props.value)}
            value={`${key}`}
          >
            {
              // @ts-ignore
              props.options[key]
            }
          </MenuItem>
        );
      })}
    </Select>
  );
  return (
    <>
      {props.nameDropdown && (
        <span className={dropdownTitle}>{props.nameDropdown}</span>
      )}
      {props.tooltip ? (
        <Tooltip key={`ot-${props.id}`} title={<>{props.tooltip}</>}>
          {dropdownButton}
        </Tooltip>
      ) : (
        dropdownButton
      )}
    </>
  );
};
