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
  TranslationFunction,
  useTranslationRef,
} from '@backstage/core-plugin-api/alpha';

import { npmTranslationRef } from '../translations';

// Workaround to avoid circular dependency issue after upgrading to Backstage 1.39.1.
// This could hopefully be removed in the future.
// Interessting issue you might want to follow:
// https://github.com/backstage/backstage/pull/30186
type T = TranslationFunction<typeof npmTranslationRef.T>;

export const useTranslation: () => { t: T } = () =>
  useTranslationRef(npmTranslationRef);
