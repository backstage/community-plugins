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
import type { FC } from 'react';

interface IconProps {
  color?: string;
}

export const ObjectiveC: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <path
      stroke="#20303c"
      strokeWidth=".3"
      d="M7.105 12.011c0 1.994-1.21 3.13-2.85 3.13-1.64-.001-2.732-1.281-2.732-3.027C1.523 10.287 2.668 9 4.344 9c1.676 0 2.76 1.342 2.76 3.011zm-4.437.09c0 1.21.608 2.169 1.65 2.169 1.042 0 1.641-.98 1.641-2.214 0-1.121-.552-2.18-1.641-2.18s-1.66 1.024-1.66 2.249l.01-.025zm4.988-2.895a9.154 9.154 0 011.577-.131 2.83 2.83 0 011.704.375c.392.231.63.656.617 1.111a1.378 1.378 0 01-.98 1.287h0a1.5 1.5 0 011.2 1.47 1.54 1.54 0 01-.572 1.224c-.421.372-1.121.553-2.204.553a10.41 10.41 0 01-1.332-.08l-.01-5.81zm1.077 2.346h.552c.75 0 1.17-.352 1.17-.856s-.42-.814-1.11-.814a2.977 2.977 0 00-.618.045l.006 1.625zm0 2.732c.19.02.382.028.573.024.696 0 1.311-.265 1.311-.98 0-.714-.597-.979-1.346-.979h-.538v1.935h0zm4.876-5.157h1.083v3.864c0 1.641-.793 2.19-1.959 2.19a2.873 2.873 0 01-.915-.156l.132-.873c.216.07.443.104.672.108.617 0 .98-.284.98-1.312l.007-3.82zm3.954 3.218v.749h-1.802v-.749zm5.255 2.546a3.793 3.793 0 01-1.532.265c-1.886 0-3.031-1.18-3.031-2.987a2.985 2.985 0 013.173-3.139 3.44 3.44 0 011.469.265l-.24.863a2.925 2.925 0 00-1.167-.231c-1.21 0-2.08.759-2.08 2.19 0 1.303.77 2.145 2.072 2.145.405.006.806-.069 1.18-.22l.156.85z"
    />
  </svg>
);
