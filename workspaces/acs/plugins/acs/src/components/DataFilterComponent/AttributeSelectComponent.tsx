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
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

export const AttributeSelectComponent = ({
  options,
  displayAttributes,
  setSelectedAttribute,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  /* eslint @typescript-eslint/no-shadow: ["error", { "allow": ["isOpen"] }]*/
  const [selected, setSelected] = React.useState<string>(options[0]);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelected(event.target.value as string);
    setSelectedAttribute(event.target.value as string);
  };

  return (
    <Select
      value={selected}
      onChange={handleChange}
      displayEmpty
      inputProps={{ 'aria-label': 'Without label' }}
    >
      {options?.map(value => (
        <MenuItem value={value}>{value}</MenuItem>
      ))}
    </Select>
  );
};

export default AttributeSelectComponent;
