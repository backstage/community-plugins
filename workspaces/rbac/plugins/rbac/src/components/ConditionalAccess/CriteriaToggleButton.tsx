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
import React, { CSSProperties } from 'react';

import { Theme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';

type CriteriaToggleButtonProps = {
  val: string;
  label: string;
  selectedCriteria: string;
  theme: Theme;
};

export const CriteriaToggleButton = ({
  val,
  label,
  selectedCriteria,
  theme,
}: CriteriaToggleButtonProps) => {
  const isSelected = val === selectedCriteria;
  const buttonStyle: CSSProperties = {
    color: isSelected ? theme.palette.infoText : theme.palette.textSubtle,
    backgroundColor: isSelected ? theme.palette.infoBackground : '',
    border: `1px solid ${theme.palette.border}`,
    width: '100%',
    textTransform: 'none',
    padding: theme.spacing(1),
  };

  return (
    <ToggleButton
      key={val}
      value={val}
      style={buttonStyle}
      size="large"
      disabled={isSelected}
    >
      {label}
    </ToggleButton>
  );
};
