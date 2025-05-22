/*
 * Copyright 2021 The Backstage Authors
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

import type { DurationInSeconds } from './types/';

/** @public */
export const pluginId = 'kiali';
/** @public */
export const KIALI_APP = 'kiali.io/id';
/** @public */
export const KIALI_NAMESPACE = 'kiali.io/namespace';
/** @public */
export const KIALI_PROVIDER = 'kiali.io/provider';
/** @public */
export const KIALI_LABEL_SELECTOR_QUERY_ANNOTATION = 'kiali.io/selector';

/** @public */
export const ANNOTATION_SUPPORTED = [KIALI_NAMESPACE, KIALI_PROVIDER];

/** @public */
export const KIALI_WIZARD_LABEL = 'kiali_wizard';
/** @public */
export const KIALI_RELATED_LABEL = 'kiali_wizard_related';
/** @public */
export const defaultMetricsDuration: DurationInSeconds = 600;
