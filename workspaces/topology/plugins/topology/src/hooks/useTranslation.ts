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
import {
  useTranslationRef,
  TranslationRef,
} from '@backstage/core-plugin-api/alpha';
import { topologyTranslationRef } from '../translations';

type TopologyMessages = typeof topologyTranslationRef extends TranslationRef<
  string,
  infer TMessages extends { [x: string]: string }
>
  ? TMessages
  : never;

export const useTranslation = (): {
  t: (key: keyof TopologyMessages, options?: Record<string, unknown>) => string;
} => {
  const { t } = useTranslationRef(topologyTranslationRef);
  return {
    t: t as unknown as (
      key: keyof TopologyMessages,
      options?: Record<string, unknown>,
    ) => string,
  };
};
