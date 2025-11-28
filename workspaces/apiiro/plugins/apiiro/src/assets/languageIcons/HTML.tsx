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

export const HTML: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <path d="M6.308 2.013h.888v.877h.811v-.877h.888v2.655h-.888v-.889h-.811v.889h-.888zm3.754.88h-.781v-.88h2.45v.881h-.781v1.774h-.888V2.893zm2.058-.88h.926l.569.933.569-.933h.925v2.655h-.883V3.352l-.611.944H13.6l-.611-.944v1.316h-.869zm3.431 0h.888v1.778h1.248v.877h-2.136zM9.694 12.278H12V10.49H9.535l.16 1.788zM5.03 5.833L6.3 20.072l5.698 1.582 5.703-1.581 1.272-14.24H5.029zm11.583 13.333L12 20.445v-1.813l-.003.001-3.577-.993-.25-2.804h1.753l.13 1.455 1.945.525H12v-2.791H8.097l-.47-5.282H12V6.997h5.699l-1.087 12.169z" />
    <path
      opacity=".8"
      d="M14.15 14.025H12v2.79l1.947-.525.203-2.265zM12 6.997v1.746h4.374l-.156 1.747H12v1.788h4.059l-.48 5.362-3.579.992v1.813l4.612-1.28L17.7 6.998H12z"
    />
    <path
      opacity=".2"
      d="M12 8.743H7.626l.471 5.281H12v-1.746H9.694l-.159-1.788H12zm0 8.072l-.002.001-1.945-.526-.13-1.454H8.17l.25 2.804 3.577.993.003-.001z"
    />
  </svg>
);
