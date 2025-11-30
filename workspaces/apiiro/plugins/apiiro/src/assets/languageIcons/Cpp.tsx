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

export const Cpp: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <g id="logo-Cpp">
      <g id="Frame 13166">
        <path
          id="Vector"
          d="M10.2759 20.2517C5.71254 20.2517 2 16.5392 2 11.9759C2 7.41255 5.71254 3.70001 10.2759 3.70001C13.2204 3.70001 15.9667 5.2846 17.4427 7.83535L13.8611 9.90788C13.1224 8.63113 11.7485 7.83794 10.2759 7.83794C7.99416 7.83794 6.13793 9.69417 6.13793 11.9759C6.13793 14.2575 7.99416 16.1138 10.2759 16.1138C11.7486 16.1138 13.1225 15.3206 13.8613 14.0436L17.4429 16.1161C15.9669 18.6671 13.2206 20.2517 10.2759 20.2517Z"
        />
        <path
          id="Vector_2"
          d="M17 11.3333H15.6666V10H14.3334V11.3333H13V12.6666H14.3334V14H15.6666V12.6666H17V11.3333Z"
        />
        <path
          id="Vector_3"
          d="M22 11.3333H20.6666V10H19.3334V11.3333H18V12.6666H19.3334V14H20.6666V12.6666H22V11.3333Z"
        />
      </g>
    </g>
  </svg>
);
