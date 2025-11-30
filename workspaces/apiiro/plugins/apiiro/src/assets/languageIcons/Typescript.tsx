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

export const Typescript: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <g id="logo-TS">
      <path
        id="Shape"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 5.01761L7.14142 5L10.3804 5.00899V5.00899L12.2564 5.02642V7.65097H8.63864V19.5407H5.67942V7.65097H2V5.01761ZM17.9799 5C19.4248 5 20.4847 5.25664 21.2894 5.58139L21.4706 5.65746L20.6832 8.29482L20.4348 8.16996C19.8914 7.9066 19.0677 7.58273 17.9422 7.58273C16.6085 7.58273 15.9623 8.22889 15.9623 8.93721C15.9623 9.75239 16.5788 10.1534 18.027 10.7518L18.4867 10.9378C20.8885 11.8553 22 13.1476 22 15.1482C22 17.5049 20.2631 19.5055 16.5256 19.5055C15.075 19.5055 13.7295 19.1248 12.9317 18.7171L12.7692 18.6295L13.3965 16.0261L13.5897 16.1268C14.3889 16.528 15.4982 16.902 16.7102 16.902C18.1231 16.902 18.871 16.2973 18.871 15.3592C18.871 14.5447 18.2832 14.0343 16.8147 13.483L16.5878 13.4C14.3253 12.5655 12.7692 11.275 12.7692 9.21036C12.7692 6.81224 14.7887 5 17.9799 5Z"
        fill={color}
      />
    </g>
  </svg>
);
