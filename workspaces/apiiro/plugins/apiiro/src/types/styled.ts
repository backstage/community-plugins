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
import { CSSProperties, ComponentType, ReactNode } from 'react';

export type StyledProps<T = {}> = T &
  Partial<{
    className: string;
    style: CSSProperties;
    as: string | ComponentType<any>;
    children: ReactNode;
  }>;

type StyledNodes<T> = {
  [K in keyof T]: T[K];
};

export function assignStyledNodes<T extends object, K>(
  mainComponent: T,
  nodes: StyledNodes<K>,
) {
  return Object.assign(mainComponent, nodes);
}
