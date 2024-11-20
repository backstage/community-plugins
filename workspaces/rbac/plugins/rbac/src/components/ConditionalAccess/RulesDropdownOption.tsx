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
import React from 'react';

import Typography from '@mui/material/Typography';

import { RulesData } from './types';

type RulesDropdownOptionProps = {
  label: string;
  rulesData?: RulesData;
  props: React.HTMLAttributes<HTMLLIElement>;
};

export const RulesDropdownOption = ({
  label,
  rulesData,
  props,
}: RulesDropdownOptionProps) => {
  const description = rulesData?.[label]?.description ?? '';
  return (
    <li
      {...props}
      style={{ display: 'flex', flexFlow: 'column', alignItems: 'flex-start' }}
      key={label}
    >
      <Typography
        sx={{
          color: theme => theme.palette.text.primary,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          color: theme => theme.palette.text.secondary,
          fontSize: '14px',
        }}
      >
        {description}
      </Typography>
    </li>
  );
};
