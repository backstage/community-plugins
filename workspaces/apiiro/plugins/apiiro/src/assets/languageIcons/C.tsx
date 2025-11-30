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

export const C: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <g id="logo-C">
      <path
        id="Vector"
        d="M13.0031 21C8.03878 21 4 16.9626 4 12C4 7.03738 8.03878 3 13.0031 3C16.2065 3 19.194 4.72324 20.7997 7.49718L16.9034 9.75106C16.0998 8.36259 14.6051 7.5 13.0031 7.5C10.5209 7.5 8.50156 9.51865 8.50156 12C8.50156 14.4813 10.5209 16.5 13.0031 16.5C14.6053 16.5 16.0999 15.6374 16.9037 14.2487L20.8 16.5025C19.1943 19.2767 16.2066 21 13.0031 21Z"
      />
    </g>
  </svg>
);
