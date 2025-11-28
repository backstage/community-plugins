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

export const Unknown: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    style={{ color }}
  >
    <g stroke="currentColor">
      <circle cx="12" cy="12" r="9.4" strokeWidth="1.2" />
      <path
        d="M12 15.3845C11.8619 15.3845 11.75 15.4964 11.75 15.6345C11.75 15.7726 11.8619 15.8845 12 15.8845"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.3845C12.1381 15.3845 12.25 15.4964 12.25 15.6345C12.25 15.7726 12.1381 15.8845 12 15.8845"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 9.94444C10 8.87056 10.8954 8 12 8C13.1046 8 14 8.87056 14 9.94444C14 11.0183 13.1046 11.8889 12 11.8889V13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
