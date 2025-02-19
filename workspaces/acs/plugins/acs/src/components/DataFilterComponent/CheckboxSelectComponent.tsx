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
import React, { useEffect } from 'react';
import {
  createStyles,
  makeStyles,
  useTheme,
  Theme,
} from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import FormHelperText from '@material-ui/core/FormHelperText';

export const CheckboxSelectComponent: React.FunctionComponent = ({
  setSelectedOptions,
  options,
  dropdownName,
}) => {
  /* eslint @typescript-eslint/no-shadow: ["error", { "allow": ["options"] }]*/
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);

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

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedItems(event.target.value as string[]);
  };

  const handleChangeMultiple = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    const { options } = event.target as HTMLSelectElement;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setSelectedOptions(value);
  };

  useEffect(() => {
    setSelectedOptions(selectedItems);
  }, [selectedItems, setSelectedOptions]);

  return (
    <Select
      labelId="demo-mutiple-checkbox-label"
      id="demo-mutiple-checkbox"
      multiple
      value={selectedItems}
      onChange={handleChange}
      input={<Input />}
      renderValue={selected => {
        if ((selected as string[]).length === 0) {
          return <em>Placeholder</em>;
        }

        return (selected as string[]).join(', ');
      }}
      MenuProps={MenuProps}
    >
      {options.map(value => (
        <MenuItem key={value} value={value}>
          <Checkbox checked={selectedItems.indexOf(value) > -1} />
          <ListItemText primary={value} />
        </MenuItem>
      ))}
    </Select>
  );
};
