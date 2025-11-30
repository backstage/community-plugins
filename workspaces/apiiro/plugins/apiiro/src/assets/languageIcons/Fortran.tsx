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

export const Fortran: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <path d="M19.75 3H4.3C4.13431 3 4 3.13431 4 3.3V4.62857C4 4.79426 4.13431 4.92857 4.3 4.92857H5.42308C5.97536 4.92857 6.42308 5.37629 6.42308 5.92857V18.0714C6.42308 18.6237 5.97536 19.0714 5.42308 19.0714H4.3C4.13431 19.0714 4 19.2057 4 19.3714V20.7C4 20.8657 4.13431 21 4.3 21H12.7865C12.9522 21 13.0865 20.8657 13.0865 20.7V19.3714C13.0865 19.2057 12.9522 19.0714 12.7865 19.0714H11.0577C10.5054 19.0714 10.0577 18.6237 10.0577 18.0714V12.6429C13.513 12.6429 13.136 14.9669 13.0904 16.3008C13.0866 16.4112 13.1761 16.5 13.2865 16.5H15.2096C15.3753 16.5 15.5096 16.3657 15.5096 16.2V7.8C15.5096 7.63431 15.3755 7.5 15.2098 7.5H13.2865C13.1761 7.5 13.0867 7.59129 13.0856 7.70174C13.0587 10.5914 12.4268 10.7143 10.0577 10.7143V4.92857H13.0865C17.2106 4.92857 18.049 8.37715 17.9573 10.3831C17.9492 10.5609 18.0877 10.7143 18.2657 10.7143H19.45C19.6157 10.7143 19.75 10.58 19.75 10.4143V3Z" />
  </svg>
);
