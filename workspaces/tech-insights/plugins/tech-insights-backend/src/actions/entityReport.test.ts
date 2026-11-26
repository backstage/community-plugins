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
import { NotAllowedError } from '@backstage/errors';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';
import {
  techInsightsCheckReadPermission,
  techInsightsCheckUpdatePermission,
  techInsightsFactRetrieverReadPermission,
} from '@backstage-community/plugin-tech-insights-common';
import { getEntityReport, EntityReportDeps } from './entityReport';

describe('getEntityReport', () => {
  const entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'service', namespace: 'default' },
  };
  const input = { kind: 'Component', namespace: 'default', name: 'service' };

  const buildDeps = (deniedPermission?: BasicPermission): EntityReportDeps => ({
    catalog: {
      getEntityByRef: jest.fn().mockResolvedValue(entity),
    } as any,
    factChecker: {
      getChecks: jest.fn().mockResolvedValue([]),
      runChecks: jest.fn().mockResolvedValue([]),
    } as any,
    permissions: {
      authorize: jest.fn().mockImplementation(([{ permission }]) =>
        Promise.resolve([
          {
            result:
              deniedPermission && permission.name === deniedPermission.name
                ? AuthorizeResult.DENY
                : AuthorizeResult.ALLOW,
          },
        ]),
      ),
    } as any,
  });

  it('runs checks when every required permission is allowed', async () => {
    const deps = buildDeps();

    await getEntityReport(deps, input, {} as any);

    expect(deps.factChecker.getChecks).toHaveBeenCalled();
    expect(deps.factChecker.runChecks).toHaveBeenCalled();
  });

  it('denies access when check-read permission is denied', async () => {
    const deps = buildDeps(techInsightsCheckReadPermission);

    await expect(getEntityReport(deps, input, {} as any)).rejects.toThrow(
      NotAllowedError,
    );
    expect(deps.factChecker.runChecks).not.toHaveBeenCalled();
  });

  it('denies access when fact-retriever-read permission is denied', async () => {
    const deps = buildDeps(techInsightsFactRetrieverReadPermission);

    await expect(getEntityReport(deps, input, {} as any)).rejects.toThrow(
      NotAllowedError,
    );
    expect(deps.factChecker.runChecks).not.toHaveBeenCalled();
  });

  it('denies access when check-run permission is denied, even if check-read is allowed', async () => {
    const deps = buildDeps(techInsightsCheckUpdatePermission);

    await expect(getEntityReport(deps, input, {} as any)).rejects.toThrow(
      NotAllowedError,
    );
    expect(deps.factChecker.runChecks).not.toHaveBeenCalled();
  });

  it('defaults a blank namespace to "default"', async () => {
    const deps = buildDeps();

    const result = await getEntityReport(
      deps,
      { kind: 'Component', namespace: '  ', name: 'service' },
      {} as any,
    );

    expect(result.entityRef).toBe('component:default/service');
    expect(deps.catalog.getEntityByRef).toHaveBeenCalledWith(
      'component:default/service',
      expect.anything(),
    );
  });
});
