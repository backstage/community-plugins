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

export const Python: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <g id="logo-python">
      <g id="Group">
        <path
          id="path1948"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.0481 1.98361C11.2929 1.98712 10.5718 2.05153 9.9372 2.16381C8.06786 2.49406 7.72846 3.1853 7.72846 4.46008V6.14366H12.1459V6.70485H7.72846H6.07062C4.78677 6.70485 3.66261 7.47652 3.31098 8.94448C2.90538 10.6271 2.88739 11.6771 3.31098 13.434C3.62499 14.7418 4.37489 15.6737 5.65873 15.6737H7.17756V13.6554C7.17756 12.1974 8.43911 10.9112 9.9372 10.9112H14.3495C15.5778 10.9112 16.5583 9.89995 16.5583 8.66646V4.46008C16.5583 3.26291 15.5483 2.36361 14.3495 2.16381C13.5907 2.03749 12.8033 1.9801 12.0481 1.98361ZM9.65916 3.33766C10.1155 3.33766 10.4881 3.71637 10.4881 4.18202C10.4881 4.64603 10.1155 5.02124 9.65916 5.02124C9.20123 5.02124 8.83024 4.64603 8.83024 4.18202C8.83024 3.71637 9.20123 3.33766 9.65916 3.33766Z"
        />
        <path
          id="path1950"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.1092 6.70483V8.66644C17.1092 10.1872 15.8198 11.4673 14.3495 11.4673H9.93719C8.72858 11.4673 7.72845 12.5017 7.72845 13.712V17.9184C7.72845 19.1156 8.76947 19.8197 9.93719 20.1632C11.3355 20.5744 12.6764 20.6487 14.3495 20.1632C15.4616 19.8412 16.5583 19.1932 16.5583 17.9184V16.2348H12.1459V15.6737H16.5583H18.767C20.0508 15.6737 20.5293 14.7781 20.9757 13.434C21.4369 12.0503 21.4173 10.7196 20.9757 8.94446C20.6585 7.66639 20.0525 6.70483 18.767 6.70483H17.1092ZM14.6275 17.3572C15.0855 17.3572 15.4565 17.7324 15.4565 18.1964C15.4565 18.6621 15.0855 19.0408 14.6275 19.0408C14.1712 19.0408 13.7986 18.6621 13.7986 18.1964C13.7986 17.7324 14.1712 17.3572 14.6275 17.3572Z"
        />
        <path
          id="path1894"
          opacity="0.44382"
          d="M17.3778 21.8161C17.3778 22.1926 16.3419 22.5405 14.6603 22.7288C12.9788 22.917 10.907 22.917 9.2254 22.7288C7.54383 22.5405 6.50793 22.1926 6.50793 21.8161C6.50793 21.4396 7.54383 21.0917 9.2254 20.9034C10.907 20.7151 12.9788 20.7151 14.6603 20.9034C16.3419 21.0917 17.3778 21.4396 17.3778 21.8161Z"
        />
      </g>
    </g>
    <defs>
      <radialGradient
        id="paint0_radial_0_1695"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(11.9429 21.8161) rotate(-90) scale(1.05388 26.7698)"
      >
        <stop stopColor="#B8B8B8" stopOpacity="0.498039" />
        <stop offset="1" stopColor="#7F7F7F" stopOpacity="0.01" />
      </radialGradient>
    </defs>
  </svg>
);
