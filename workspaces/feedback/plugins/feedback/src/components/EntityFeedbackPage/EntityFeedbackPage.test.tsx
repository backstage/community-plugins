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
  BackstageUserIdentity,
  configApiRef,
  IdentityApi,
  identityApiRef,
} from '@backstage/core-plugin-api';
import {
  EntityProvider,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import {
  MockConfigApi,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';

import { FeedbackAPI, feedbackApiRef } from '../../api';
import {
  mockEntity,
  mockErrorList,
  mockExperienceList,
  mockFeedback,
} from '../../mocks';
import { EntityFeedbackPage } from './EntityFeedbackPage';

describe('Entity Feedback Page', () => {
  const feedbackApi: Partial<FeedbackAPI> = {
    getAllFeedbacks: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: [mockFeedback],
        count: 1,
        currentPage: 1,
        pageSize: 5,
      });
    }),
    getErrorList: jest.fn().mockReturnValue(mockErrorList),
    getExperienceList: jest.fn().mockReturnValue(mockExperienceList),
  };

  const mockIdentityApi: Partial<IdentityApi> = {
    getBackstageIdentity: jest
      .fn()
      .mockImplementation((): BackstageUserIdentity => {
        return {
          userEntityRef: 'user:default/guest',
          type: 'user',
          ownershipEntityRefs: [],
        };
      }),
  };

  const mockConfigApi = new MockConfigApi({
    feedback: { integrations: { jira: [{ host: 'https://jira-server-url' }] } },
  });

  const render = async () =>
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [feedbackApiRef, feedbackApi],
          [identityApiRef, mockIdentityApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <EntityFeedbackPage />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name/': entityRouteRef,
        },
      },
    );

  it('Should render', async () => {
    const rendered = await render();
    expect(rendered).toBeDefined();
  });

  it('Should have buttons', async () => {
    const rendered = await render();
    expect(
      rendered.getByRole('button', {
        name: 'Give a feedback / Report a issue',
      }),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Refresh' }),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('link', { name: 'Go to Jira Project' }),
    ).toBeInTheDocument();
  });
});
