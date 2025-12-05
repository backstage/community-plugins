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

export const Clojure: FC<IconProps> = ({ color: colorProp }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  // Use provided color or theme's text color
  const mainColor = colorProp || 'currentColor';
  // Use white for dark theme, black for light theme
  const contrastColor = isDark ? 'gray' : '#FFFFFF';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={mainColor}
    >
      <path
        fill={contrastColor}
        d="M12 2C6.486 2 2 6.594 2 12.24c0 5.647 4.486 10.24 10 10.24s10-4.593 10-10.24C22 6.594 17.514 2 12 2"
      />
      <g>
        <path
          opacity=".8"
          d="M11.634 12.423c-.09.2-.189.424-.292.663-.362.842-.764 1.866-.911 2.522a3.904 3.904 0 00-.085.845c0 .127.007.26.017.397a4.69 4.69 0 001.646.3 4.676 4.676 0 001.507-.252 2.75 2.75 0 01-.314-.34c-.643-.839-1.001-2.068-1.568-4.134M9.263 8.258a4.93 4.93 0 00-2.032 4 4.932 4.932 0 001.977 3.959c.294-1.251 1.029-2.397 2.131-4.693a16.3 16.3 0 00-.224-.597c-.305-.785-.746-1.696-1.14-2.108a3.147 3.147 0 00-.712-.561"
        />
        <path d="M16.171 17.869c-.632-.081-1.155-.18-1.612-.344a5.613 5.613 0 01-2.55.611c-3.17 0-5.74-2.631-5.741-5.879 0-1.762.758-3.342 1.958-4.42a4.178 4.178 0 00-.998-.124c-1.684.016-3.462.97-4.203 3.549-.069.375-.052.659-.052.995 0 5.111 4.046 9.254 9.037 9.254 3.056 0 5.756-1.555 7.391-3.933-.884.225-1.735.333-2.463.336-.273 0-.53-.015-.767-.045" />
        <path
          opacity=".8"
          d="M14.473 16.076c.056.028.182.075.359.126a4.931 4.931 0 001.956-3.945c-.005-2.702-2.14-4.888-4.779-4.893a4.691 4.691 0 00-1.5.25c.97 1.132 1.437 2.75 1.888 4.521v.002c.002.002.145.492.392 1.142.244.65.593 1.453.973 2.04.25.392.524.674.711.757"
        />
        <path d="M12.009 3.003c-3.026 0-5.704 1.526-7.344 3.865a4.513 4.513 0 012.486-.737c1.05.003 1.876.336 2.272.564.096.057.187.118.276.18a5.6 5.6 0 012.31-.497c3.171 0 5.742 2.632 5.742 5.88a5.93 5.93 0 01-1.708 4.182c.259.03.535.049.816.047 1.001 0 2.083-.226 2.894-.924.529-.456.972-1.124 1.218-2.126a9.56 9.56 0 00.075-1.18c0-5.11-4.045-9.254-9.037-9.254" />
      </g>
    </svg>
  );
};
