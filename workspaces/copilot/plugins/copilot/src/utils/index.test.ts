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

import { findMetricsTypeFromPath } from './index';

describe('findMetricsTypeFromPath', () => {
  it('should return enterprise metrics type for enterprise path', () => {
    expect(findMetricsTypeFromPath('/copilot/enterprise')).toBe('enterprise');
    expect(findMetricsTypeFromPath('/copilot/enterprise/dashboard')).toBe(
      'enterprise',
    );
    expect(findMetricsTypeFromPath('/suburl/copilot/enterprise')).toBe(
      'enterprise',
    );
  });

  it('should return organization metrics type for organization path', () => {
    expect(findMetricsTypeFromPath('/copilot/organization')).toBe(
      'organization',
    );
    expect(findMetricsTypeFromPath('/copilot/organization/stats')).toBe(
      'organization',
    );
    expect(findMetricsTypeFromPath('/suburl/copilot/organization')).toBe(
      'organization',
    );
  });

  it('should return undefined for non-matching paths', () => {
    expect(findMetricsTypeFromPath('/copilot')).toBeUndefined();
    expect(findMetricsTypeFromPath('/some/other/path')).toBeUndefined();
    expect(findMetricsTypeFromPath('')).toBeUndefined();
  });
});
