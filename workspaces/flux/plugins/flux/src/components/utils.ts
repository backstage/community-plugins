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
import { Condition, FluxObject } from '../objects';

/**
 * Find the timestamp of the first "Ready" condition.
 * @public
 */
export function automationLastUpdated(a: FluxObject): string {
  return (
    (a.conditions?.find(condition => condition.type === 'Ready') || {})
      .timestamp || ''
  );
}

export interface VerifiableSource {
  isVerifiable: boolean;
  conditions: Condition[];
}

/**
 * Returns the SourceVerified condition if any.
 * @public
 */
export const findVerificationCondition = (
  a: VerifiableSource,
): Condition | undefined =>
  a.conditions.find(condition => condition.type === 'SourceVerified');
