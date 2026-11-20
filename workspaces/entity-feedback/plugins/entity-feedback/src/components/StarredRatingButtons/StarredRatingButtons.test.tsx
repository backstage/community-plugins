/*
 * Copyright 2023 The Backstage Authors
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

import { Entity } from '@backstage/catalog-model';
import {
  ErrorApi,
  errorApiRef,
  IdentityApi,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { AsyncEntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EntityFeedbackApi, entityFeedbackApiRef } from '../../api';
import {
  StarredFeedbackRatings,
  StarredRatingButtons,
} from './StarredRatingButtons';

jest.mock('../FeedbackResponseDialog', () => ({
  FeedbackResponseDialog: ({ open }: { open: boolean }) => {
    return <>{open && <span>dialog is open</span>}</>;
  },
}));

describe('StarredRatingButtons', () => {
  const sampleRatings = [
    {
      userRef: 'user:default/me',
      rating: StarredFeedbackRatings.two.toString(),
    },
    {
      userRef: 'user:default/someone',
      rating: StarredFeedbackRatings.five.toString(),
    },
  ];

  const testEntity = {
    kind: 'component',
    metadata: { name: 'test', namespace: 'default' },
  } as Entity;

  const errorApi: Partial<ErrorApi> = { post: jest.fn() };
  const getRatings = jest.fn(async () => sampleRatings);

  const feedbackApi: Partial<EntityFeedbackApi> = {
    getRatings,
    recordRating: jest.fn().mockImplementation(() => Promise.resolve()),
  };

  const identityApi: Partial<IdentityApi> = {
    getBackstageIdentity: async () => ({
      type: 'user',
      userEntityRef: 'user:default/me',
      ownershipEntityRefs: [],
    }),
  };

  const render = async (props: any = {}) =>
    renderInTestApp(
      <TestApiProvider
        apis={[
          [entityFeedbackApiRef, feedbackApi],
          [errorApiRef, errorApi],
          [identityApiRef, identityApi],
        ]}
      >
        <AsyncEntityProvider loading={false} entity={testEntity}>
          <StarredRatingButtons {...props} />
        </AsyncEntityProvider>
      </TestApiProvider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('names all five rating buttons and marks only the saved rating as pressed', async () => {
    await render();
    const selectedButton = await screen.findByRole('button', {
      name: 'Rate 2 stars',
      pressed: true,
    });

    expect(getRatings).toHaveBeenCalledWith('component:default/test');
    expect(screen.getAllByRole('button', { pressed: true })).toEqual([
      selectedButton,
    ]);
    expect(screen.getAllByRole('button', { pressed: false })).toEqual([
      screen.getByRole('button', { name: 'Rate 1 star' }),
      screen.getByRole('button', { name: 'Rate 3 stars' }),
      screen.getByRole('button', { name: 'Rate 4 stars' }),
      screen.getByRole('button', { name: 'Rate 5 stars' }),
    ]);
  });

  it('leaves all five buttons unpressed when the user has no saved rating', async () => {
    getRatings.mockResolvedValueOnce([sampleRatings[1]]);
    await render();

    expect(
      await screen.findAllByRole('button', { pressed: false }),
    ).toHaveLength(5);
    expect(screen.queryByRole('button', { pressed: true })).toBeNull();
  });

  it('records a new rating and moves the pressed state to that button', async () => {
    await render();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Rate 3 stars' }),
    );
    expect(feedbackApi.recordRating).toHaveBeenCalledWith(
      'component:default/test',
      StarredFeedbackRatings.three.toString(),
    );
    expect(
      await screen.findByRole('button', {
        name: 'Rate 3 stars',
        pressed: true,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Rate 2 stars', pressed: false }),
    ).toBeInTheDocument();

    expect(feedbackApi.recordRating).toHaveBeenCalledTimes(1);
  });

  it('does not record the already selected rating again', async () => {
    await render();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Rate 2 stars' }),
    );
    expect(feedbackApi.recordRating).not.toHaveBeenCalled();
  });

  it('opens a response dialog if a rating under the threshold is selected', async () => {
    const rendered = await render();

    expect(rendered.queryByText('dialog is open')).toBeNull();

    await userEvent.click(
      rendered.getByTestId('entity-feedback-star-button-1'),
    );
    expect(rendered.getByText('dialog is open')).toBeInTheDocument();
  });

  it('opens a response dialog if a rating under a custom threshold is selected', async () => {
    const rendered = await render({ requestResponseThreshold: 4 });

    expect(rendered.queryByText('dialog is open')).toBeNull();

    await userEvent.click(
      rendered.getByTestId('entity-feedback-star-button-3'),
    );
    expect(rendered.getByText('dialog is open')).toBeInTheDocument();
  });

  it('does not open a response dialog if configured not to', async () => {
    const rendered = await render({ requestResponse: false });

    expect(rendered.queryByText('dialog is open')).toBeNull();

    await userEvent.click(
      rendered.getByTestId('entity-feedback-star-button-1'),
    );
    expect(rendered.queryByText('dialog is open')).toBeNull();
  });
});
