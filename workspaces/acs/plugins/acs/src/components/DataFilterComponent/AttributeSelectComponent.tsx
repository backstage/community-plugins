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

import { useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

interface AttributeSelectProps {
  options: string[];
  setSelectedAttribute: (value: string) => void;
}

export const AttributeSelectComponent = ({
  options,
  setSelectedAttribute,
}: AttributeSelectProps) => {
  /* eslint @typescript-eslint/no-shadow: ["error", { "allow": ["isOpen"] }]*/
  const [selected, setSelected] = useState<string>(options[0]);

  const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
    setSelected(event.target.value as string);
    setSelectedAttribute(event.target.value as string);
  };

  return (
    <Select
      value={selected}
      onChange={handleChange}
      displayEmpty
      inputProps={{ 'aria-label': 'attribute' }}
    >
      {options?.map((value: string) => (
        <MenuItem value={value}>{value}</MenuItem>
      ))}
    </Select>
  );
};

export default AttributeSelectComponent;
