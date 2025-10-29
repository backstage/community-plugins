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
  IdentityApi,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';

import { FeedbackAPI, feedbackApiRef } from '../../api';
import { mockFeedback, mockJiraDetails } from '../../mocks';
import { rootRouteRef } from '../../routes';
import { FeedbackDetailsModal } from './FeedbackDetailsModal';

jest.mock('@backstage/plugin-catalog-react', () => ({
  EntityRefLink: (props: { entityRef: string }) => (
    <a href="https://localhost">{props.entityRef}</a>
  ),
}));

jest.mock('@backstage/core-components', () => ({
  useQueryParamState: () => [mockFeedback.feedbackId, jest.fn()],
  Progress: () => <></>,
}));

describe('Feedback details modal', () => {
  const mockFeedbackApi: Partial<FeedbackAPI> = {
    getFeedbackById: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: mockFeedback,
        message: 'Feedback fetched successfully',
      });
    }),
    getTicketDetails: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockJiraDetails.data);
    }),
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

  const render = async () =>
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [feedbackApiRef, mockFeedbackApi],
          [identityApiRef, mockIdentityApi],
        ]}
      >
        <FeedbackDetailsModal />
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/': rootRouteRef,
        },
      },
    );

  beforeEach(() => jest.clearAllMocks());

  it('should render', async () => {
    const rendered = await render();
    expect(mockFeedbackApi.getFeedbackById).toHaveBeenCalledTimes(1);
    expect(mockFeedbackApi.getTicketDetails).toHaveBeenCalledTimes(1);
    expect(rendered).toBeDefined();
  });

  it('should have correct summary', async () => {
    const rendered = await render();
    expect(
      rendered.getByRole('heading', { name: mockFeedback.summary }),
    ).toBeInTheDocument();
  });

  it('should have correct description', async () => {
    const rendered = await render();
    expect(rendered.getByText(mockFeedback.description)).toBeInTheDocument();
  });

  it('should have correct user id', async () => {
    const rendered = await render();
    expect(rendered.getByText(mockFeedback.createdBy)).toBeInTheDocument();
  });

  it('should have correct project id', async () => {
    const rendered = await render();
    expect(rendered.getByText(mockFeedback.projectId)).toBeInTheDocument();
  });

  it('should have correct tag', async () => {
    const rendered = await render();
    expect(rendered.getByText('Tag')).toBeInTheDocument();
    expect(rendered.getByText(mockFeedback.tag)).toBeInTheDocument();
  });

  it('should have ticket url', async () => {
    const rendered = await render();
    expect(rendered.getByText('Ticket Id')).toBeInTheDocument();
    expect(
      rendered.getByText(mockFeedback.ticketUrl.split('/').pop()!),
    ).toBeInTheDocument();
  });

  it('should have correct status field for jira ticket', async () => {
    const rendered = await render();
    expect(rendered.getByText('Status')).toBeInTheDocument();
    expect(rendered.getByText(mockJiraDetails.data.status)).toBeInTheDocument();
  });

  it('should have assignee for jira ticket', async () => {
    const rendered = await render();
    expect(rendered.getByText('Assignee')).toBeInTheDocument();
    expect(
      rendered.getByText(mockJiraDetails.data.assignee),
    ).toBeInTheDocument();
  });
});
