/*
 * Copyright 2026 The Backstage Authors
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

import { resolveMaturityRoute } from './MaturityLink';

describe('resolveMaturityRoute', () => {
  const currentEntityPath = '/catalog/default/system/example';
  const targetEntityPath = '/catalog/default/component/child';

  it('applies the registered route path to the target entity', () => {
    expect(
      resolveMaturityRoute(
        `${currentEntityPath}/scorecards`,
        currentEntityPath,
        targetEntityPath,
      ),
    ).toBe(`${targetEntityPath}/scorecards`);
  });

  it('also handles a route resolved as a relative mount path', () => {
    expect(
      resolveMaturityRoute('/scorecards', currentEntityPath, targetEntityPath),
    ).toBe(`${targetEntityPath}/scorecards`);
  });

  it('preserves the default route', () => {
    expect(
      resolveMaturityRoute(
        `${currentEntityPath}/maturity`,
        currentEntityPath,
        targetEntityPath,
      ),
    ).toBe(`${targetEntityPath}/maturity`);
  });
});
