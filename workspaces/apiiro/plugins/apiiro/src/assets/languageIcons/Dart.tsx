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

export const Dart: FC<IconProps> = ({ color: colorProp }) => {
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
      <path d="M6.07881 17.9214L2.65726 14.4998C2.25143 14.0837 2 13.4955 2 12.9206C2 12.6545 2.14998 12.2384 2.2632 12.0002L5.42156 5.42172L6.07881 17.9214Z" />
      <path
        fill={contrastColor}
        d="M17.7903 6.079L14.3688 2.65744C14.0703 2.35748 13.4483 2.00018 12.9219 2.00018C12.469 2.00018 12.025 2.09135 11.7383 2.26338L5.42303 5.42174L17.7903 6.079Z"
      />
      <path d="M10.1576 22.0002H18.4476V18.4478L12.2632 16.4731L6.60521 18.4478L10.1576 22.0002Z" />
      <path
        fill={contrastColor}
        d="M5.42155 16.079C5.42155 17.1347 5.55389 17.3935 6.07881 17.9214L6.6052 18.4477H18.4476L12.6587 11.8693L5.42155 5.42172V16.079Z"
      />
      <path d="M15.9479 5.42026H5.42155L18.4476 18.4463H22V10.2887L17.7889 6.07751C17.1978 5.48495 16.6728 5.42026 15.9479 5.42026Z" />
    </svg>
  );
};
