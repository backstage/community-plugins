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

export const Terraform: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.06641 11.8413L14.5334 14.9985V8.68404L9.06641 5.52682V11.8413ZM14.5334 15.6882V22L9.06641 18.8428V12.531L14.5334 15.6882Z"
      />
      <path d="M20.605 11.8387V5.52429L15.1354 8.68151V14.9959L20.605 11.8387Z" />
      <path d="M8.46699 11.4719V5.15749L3 2.00027V8.3147L8.46699 11.4719Z" />
    </g>
  </svg>
);
