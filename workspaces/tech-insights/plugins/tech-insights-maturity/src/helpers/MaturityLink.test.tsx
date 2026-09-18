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
/** @jest-environment jsdom */

import { RouteRef } from '@backstage/core-plugin-api';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import { renderInTestApp } from '@backstage/test-utils';
import { Route, Routes } from 'react-router-dom';

import { MaturityLink, resolveMaturityRoute } from './MaturityLink';
import { rootRouteRef } from '../routes';

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

describe('<MaturityLink />', () => {
  const entityPath = '/catalog/:namespace/:kind/:name';

  // The link is rendered from inside an entity page, which is what gives it the
  // route params it uses to rewrite the current maturity path onto the target
  // entity.
  const renderLink = async (mountedRoutes: Record<string, RouteRef>) =>
    renderInTestApp(
      <Routes>
        <Route
          path={entityPath}
          element={
            <MaturityLink entity="component:default/child">child</MaturityLink>
          }
        />
      </Routes>,
      {
        routeEntries: ['/catalog/default/system/example'],
        mountedRoutes,
      },
    );

  it('follows the registered maturity route', async () => {
    const { getByRole } = await renderLink({
      [entityPath]: entityRouteRef,
      '/scorecards': rootRouteRef,
    });

    expect(getByRole('link', { name: 'child' })).toHaveAttribute(
      'href',
      '/catalog/default/component/child/scorecards',
    );
  });

  it('keeps the default route when the maturity route is mounted at it', async () => {
    const { getByRole } = await renderLink({
      [entityPath]: entityRouteRef,
      '/maturity': rootRouteRef,
    });

    expect(getByRole('link', { name: 'child' })).toHaveAttribute(
      'href',
      '/catalog/default/component/child/maturity',
    );
  });

  it('falls back to the default route when no maturity route is mounted', async () => {
    const { getByRole } = await renderLink({
      [entityPath]: entityRouteRef,
    });

    expect(getByRole('link', { name: 'child' })).toHaveAttribute(
      'href',
      '/catalog/default/component/child/maturity',
    );
  });
});
