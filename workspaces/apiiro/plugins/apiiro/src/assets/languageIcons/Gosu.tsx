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

export const Gosu: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <path d="M5.11 10.63c0-.78-.02-1.57.01-2.36.05-1.3.77-2.14 2.07-2.21 1.58-.1 3.17-.04 4.76-.05.33-.01.48.17.49.48 0 .02 0 .05.01.07.12 1.42.08 1.46-1.37 1.46-.84 0-1.68.01-2.52 0-.59 0-.91.23-.9.86.01 1.16.01 2.32 0 3.48-.01.54.23.84.77.85.57.01 1.14.01 1.71-.02.69-.05.51-.58.53-.99.03-.45-.18-.62-.63-.64-.92-.03-1.2-.47-.95-1.38.08-.3.28-.37.54-.37h3.05c.38 0 .56.18.56.56-.01 1.34-.01 2.68-.01 4.01 0 .37-.19.57-.56.6-1.74.13-3.47.33-5.21.26-1.52-.06-2.3-.87-2.35-2.37-.02-.74 0-1.49 0-2.24m13.36-2.01c.71 0 1.41.01 2.12 0 .48-.01.72.14.72.68.02 1.37.04 1.37-1.34 1.37h-2.45c-.49.01-.94.08-.95.73-.01.69.45.77.98.77.7.01 1.41-.01 2.11.01 1.51.05 2.3.86 2.33 2.36.01.37.02.75 0 1.12-.07 1.29-.86 2.14-2.16 2.21-1.76.08-3.52-.1-5.28-.23-.3-.02-.43-.19-.44-.47-.01-.09-.01-.17-.01-.26.02-1.17-.23-1.24 1.27-1.21 1.12.02 2.11.04 3.17.14.74.06 1.13-.55.86-1.23-.1-.27-.35-.25-.55-.25-.73-.02-1.46-.01-2.18-.02-1.81-.02-2.68-.88-2.69-2.68 0-.31-.01-.62.03-.92.18-1.34.92-2.03 2.28-2.1.73-.03 1.45 0 2.18 0v-.02M3.74 14.03c0 .78-.1.88-.86.88-.77 0-.85-.1-.88-.86-.02-.61.18-.88.83-.86.8.03.9.1.91.84" />
  </svg>
);
