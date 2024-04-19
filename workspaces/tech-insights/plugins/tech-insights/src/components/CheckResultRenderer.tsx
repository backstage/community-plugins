/*
 * Copyright 2022 The Backstage Authors
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

import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import React from 'react';
import { BooleanCheck, isBooleanCheckFailed } from './BooleanCheck';

/**
 * Defines a react component that is responsible for rendering a result of a given type.
 *
 * @public
 */
export type CheckResultRenderer = {
  type: string;
  component: (check: CheckResult) => React.ReactElement;
  description?: (check: CheckResult) => string | React.ReactElement;
  isFailed?: (check: CheckResult) => boolean;
};

/**
 * Default renderer for json-rules-engine check results.
 *
 * @public
 */
export const jsonRulesEngineCheckResultRenderer: CheckResultRenderer = {
  type: 'json-rules-engine',
  component: (checkResult: CheckResult) => (
    <BooleanCheck checkResult={checkResult} />
  ),
  isFailed: isBooleanCheckFailed,
};
