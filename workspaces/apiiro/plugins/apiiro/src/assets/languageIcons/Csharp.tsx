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

export const Csharp: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <g id="logo-Csharp">
      <path
        id="Vector"
        d="M10.2759 20.2517C5.71254 20.2517 2 16.5392 2 11.9759C2 7.41255 5.71254 3.70001 10.2759 3.70001C13.2204 3.70001 15.9667 5.2846 17.4427 7.83535L13.8611 9.90788C13.1224 8.63113 11.7485 7.83794 10.2759 7.83794C7.99416 7.83794 6.13793 9.69417 6.13793 11.9759C6.13793 14.2575 7.99416 16.1138 10.2759 16.1138C11.7486 16.1138 13.1225 15.3206 13.8613 14.0436L17.4429 16.1161C15.9669 18.6671 13.2206 20.2517 10.2759 20.2517Z"
      />
      <path
        id="Vector_2"
        d="M22 11.5114V10.4228H21.32L21.67 9.00854H20.28L19.93 10.4228H18.85L19.2 9.00854H17.81L17.46 10.4228H16V11.5114H17.2L16.95 12.5143H16V13.6114H16.67L16.32 15H17.7L18.05 13.6114H19.13L18.78 15H20.17L20.51 13.6114H21.98V12.5143H20.78L21.03 11.5114H21.98H22ZM19.53 12.5228H18.21L18.47 11.5028H19.78L19.52 12.5228H19.53Z"
      />
    </g>
  </svg>
);
