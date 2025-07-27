/*
 * Copyright 2025 The Backstage Authors
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
import type { ChangeEvent } from 'react';

import { useState, useEffect } from 'react';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';

interface CheckboxSelectProps {
  setSelectedOptions: any;
  options: string[];
  dropdownName: string;
}

export const CheckboxSelectComponent = ({
  setSelectedOptions,
  options,
  dropdownName,
}: CheckboxSelectProps) => {
  /* eslint @typescript-eslint/no-shadow: ["error", { "allow": ["options"] }]*/
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
    setSelectedItems(event.target.value as string[]);
  };

  useEffect(() => {
    setSelectedOptions(selectedItems);
  }, [selectedItems, setSelectedOptions]);

  return (
    <Select
      labelId="demo-mutiple-checkbox-label"
      id="demo-mutiple-checkbox"
      multiple
      displayEmpty
      value={selectedItems}
      onChange={handleChange}
      input={<Input />}
      renderValue={selected => {
        if ((selected as string[]).length === 0) {
          return <em>{dropdownName}</em>;
        }

        return (selected as string[]).join(', ');
      }}
      MenuProps={MenuProps}
      inputProps={{ 'aria-label': dropdownName }}
    >
      <MenuItem disabled value="">
        <em>{dropdownName}</em>
      </MenuItem>
      {options.map(value => (
        <MenuItem key={value} value={value}>
          <Checkbox checked={selectedItems.indexOf(value) > -1} />
          <ListItemText primary={value} />
        </MenuItem>
      ))}
    </Select>
  );
};
