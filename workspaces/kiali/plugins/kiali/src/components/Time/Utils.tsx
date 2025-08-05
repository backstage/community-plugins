/*
 * Copyright 2024 The Backstage Authors
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
import { TimeInMilliseconds } from '@backstage-community/plugin-kiali-common/types';

const defaultOptions = {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
} as any;

export const toString = (time: TimeInMilliseconds, options?: any): string => {
  const formatOptions = { ...defaultOptions };
  const date = new Date(time);
  if (date.getFullYear() !== new Date().getFullYear()) {
    formatOptions.year = 'numeric';
  }
  return date.toLocaleString('en-US', { ...formatOptions, ...options });
};
