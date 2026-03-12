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
import { forwardRef } from 'react';
import Chip from '@mui/material/Chip';

export enum TagColor {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  DEPENDENCIES = 'dependencies',
  CODE = 'code',
  CONTAINERS = 'containers',
  ACTIVE = 'active',
  DISABLED = 'disabled',
  SUCCESS = 'success',
  NEUTRAL = 'neutral',
}

export const colorVariants: {
  [key: string]: {
    backgroundColor: string;
    color: string;
  };
} = {
  critical: {
    backgroundColor: '#a72461',
    color: 'white',
  },
  high: {
    backgroundColor: '#f73c57',
    color: 'white',
  },
  medium: {
    backgroundColor: '#f09c4f',
    color: '#232f3e',
  },
  low: {
    backgroundColor: '#f6bc35',
    color: '#232f3e',
  },
  dependencies: {
    backgroundColor: '#3453c1',
    color: 'white',
  },
  code: {
    backgroundColor: '#3e8bff',
    color: 'white',
  },
  containers: {
    backgroundColor: '#4bc4d4',
    color: 'white',
  },
  active: {
    backgroundColor: '#E7F5FC',
    color: '#0073B9',
  },
  disabled: {
    backgroundColor: '#EDEEEF',
    color: '#232F3E',
  },
  success: {
    backgroundColor: '#E9F7F4',
    color: '#007C5D',
  },
  neutral: {
    backgroundColor: '#E7E8EB',
    color: '#232F3E',
  },
};

type TagProps = {
  color?: TagColor;
  label: string | number;
  shapeVariant?: 'rounded' | 'square';
  width?: string;
  height?: string;
  fontWeight?: number;
};

export const Tag = forwardRef<HTMLDivElement, TagProps>(
  (
    {
      label = '',
      color = TagColor.NEUTRAL,
      shapeVariant = 'rounded',
      width = 'auto',
      height = '',
      fontWeight = 400,
    },
    ref,
  ) => {
    return (
      <Chip
        label={label}
        ref={ref}
        sx={{
          ...colorVariants[color],
          borderRadius: shapeVariant === 'square' ? '4px' : '',
          width,
          margin: 0,
          textTransform: 'none',
          height,
          '& .MuiChip-label': {
            fontSize: '12px',
            fontWeight,
          },
        }}
      />
    );
  },
);
