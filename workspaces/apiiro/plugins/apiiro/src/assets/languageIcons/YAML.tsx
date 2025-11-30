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

export const YAML: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <g clipPath="url(#clip0_13988_3157)">
      <path d="M10.8726 3.50018L7.63988 8.29262V11.7335H5.28749V8.39855L2 3.50018H4.67748L6.51483 6.44066L8.28277 3.50018H10.8726Z" />
      <path d="M9.42609 11.7335L12.5894 3.50018H15.1536L18.3169 11.7335H15.8952L15.3107 10.0533H12.3666L11.7821 11.7335H9.42244H9.42609ZM14.7957 8.55927L13.8386 5.84526L12.8816 8.55927H14.792H14.7957Z" />
      <path d="M14.8249 20.5002H12.4871V15.043L10.7813 18.5642H9.17769L7.47185 15.043V20.5002H5.25827V12.2668H7.96863L10.0434 16.3324L12.1109 12.2668H14.8212V20.5002H14.8249Z" />
      <path d="M22.1889 20.5002H15.939V12.2668H18.2914V18.9295H22.1889V20.5002Z" />
    </g>
    <defs>
      <clipPath id="clip0_13988_3157">
        <rect width="20.1889" height="17" transform="translate(2 3.50018)" />
      </clipPath>
    </defs>
  </svg>
);
