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

import {
  HealthConfig,
  RegexConfig,
} from '@backstage-community/plugin-kiali-common/types';

const allMatch = new RegExp('.*');

/* Replace x|X by the regular expression
   Example: 4XX or 5XX to 4\d\d 5\d\d
*/
const replaceXCode = (value: string): string => {
  return value.replace(/x|X/g, '\\d');
};

/*
  Convert the string to regex, if isCode is true then call to replaceXCode to change the X|x in code expression to \d
*/
export const getExpr = (
  value: RegexConfig | undefined,
  isCode: boolean = false,
): RegExp => {
  if (value) {
    if (typeof value === 'string' && value !== '') {
      const v = value.replace('\\\\', '\\');
      return new RegExp(isCode ? replaceXCode(v) : v);
    }
    if (typeof value === 'object' && value.toString() !== '/(?:)/') {
      return value;
    }
  }
  return allMatch;
};

/*
 Parse configuration from backend format to regex expression
*/
export const parseHealthConfig = (healthConfig: HealthConfig) => {
  for (const [key, r] of Object.entries(healthConfig.rate)) {
    healthConfig.rate[key as any].namespace = getExpr(
      healthConfig.rate[key as any].namespace,
    );
    healthConfig.rate[key as any].name = getExpr(
      healthConfig.rate[key as any].name,
    );
    healthConfig.rate[key as any].kind = getExpr(
      healthConfig.rate[key as any].kind,
    );
    for (const t of Object.values(r.tolerance)) {
      t.code = getExpr(t.code, true);
      t.direction = getExpr(t.direction);
      t.protocol = getExpr(t.protocol);
    }
  }
  return healthConfig;
};

/*
 Export for tests
*/
export const allMatchTEST = allMatch;
export const getExprTEST = getExpr;
export const replaceXCodeTEST = replaceXCode;
