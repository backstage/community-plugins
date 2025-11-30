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
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';

interface IconProps {
  color?: string;
}

export const Kotlin: FC<IconProps> = ({ color: colorProp }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  // Use provided color or theme's text color
  const mainColor = colorProp || 'currentColor';
  // Use white for dark theme, black for light theme
  const contrastColor = isDark ? 'gray' : 'rgb(222, 219, 219)';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={mainColor}
    >
      <g id="logo-Kotlin">
        <g id="Group 4">
          <path
            id="Fill 1"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 21H21L12.03 11.97L3 21Z"
          />
          <path
            id="Fill 2"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 2.99994V12.7499L12.03 2.99994H3Z"
          />
          <path
            id="Fill 3"
            fillRule="evenodd"
            clipRule="evenodd"
            fill={contrastColor}
            d="M12.0302 2.99994L3.00015 12.5102V20.9999L12.0302 11.9699L21.0002 2.99994H12.0302Z"
          />
        </g>
      </g>
    </svg>
  );
};
