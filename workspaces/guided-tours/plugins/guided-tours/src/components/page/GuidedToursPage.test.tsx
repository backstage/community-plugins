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
import {
  mockApis,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { guidedTourApiRef } from '@backstage-community/plugin-guided-tours-react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { DefaultGuidedTourApi } from '../../api/DefaultGuidedTourApi';
import { GuidedToursPage } from './GuidedToursPage';

const tours = [
  {
    id: 'app/welcome',
    title: 'Welcome',
    description: 'A first look.',
    autoStart: 'login' as const,
    order: 1,
    steps: [
      { id: 'a', content: 'one' },
      { id: 'b', content: 'two', route: '/catalog' },
    ],
  },
  {
    id: 'catalog/intro',
    title: 'Catalog',
    autoStart: { path: '/catalog' },
    steps: [{ id: 'a', content: 'one' }],
  },
];

function Location() {
  return <span>location:{useLocation().pathname}</span>;
}

async function renderPage(api: DefaultGuidedTourApi) {
  return renderInTestApp(
    <TestApiProvider apis={[[guidedTourApiRef, api]]}>
      <GuidedToursPage />
      <Location />
    </TestApiProvider>,
  );
}

describe('GuidedToursPage', () => {
  it('lists the tours with their status and auto-start hints', async () => {
    const api = new DefaultGuidedTourApi({
      tours,
      storageApi: mockApis.storage(),
    });
    api.start('catalog/intro');
    api.dismiss();
    await renderPage(api);

    expect(screen.getByRole('heading', { name: 'Guided tours' })).toBeVisible();
    const welcome = screen
      .getByRole('heading', { name: 'Welcome' })
      .closest(
        '[data-guided-tour="guided-tours.row.app/welcome"]',
      ) as HTMLElement;
    expect(within(welcome).getByText('New')).toBeVisible();
    expect(within(welcome).getByText('A first look.')).toBeVisible();
    expect(
      within(welcome).getByText(/2 steps · Starts on login/),
    ).toBeVisible();
    expect(
      within(welcome).getByRole('button', { name: 'Start' }),
    ).toBeVisible();

    const catalog = screen
      .getByRole('heading', { name: 'Catalog' })
      .closest(
        '[data-guided-tour="guided-tours.row.catalog/intro"]',
      ) as HTMLElement;
    expect(within(catalog).getByText('Dismissed')).toBeVisible();
    expect(
      within(catalog).getByText(/1 steps · Starts on first visit of \/catalog/),
    ).toBeVisible();
    expect(
      within(catalog).getByRole('button', { name: 'Restart' }),
    ).toBeVisible();
  });

  it('starts, continues on the right page and resets everything', async () => {
    const api = new DefaultGuidedTourApi({
      tours,
      storageApi: mockApis.storage(),
    });
    await renderPage(api);

    // tours are listed by order: the welcome tour comes first
    await userEvent.click(screen.getAllByRole('button', { name: 'Start' })[0]);
    expect(api.getSnapshot().state).toMatchObject({
      activeTourId: 'app/welcome',
      stepIndex: 0,
    });

    // leave the tour on its second step: the page offers to continue there
    api.next();
    api.resetProgress('catalog/intro');
    api.start('catalog/intro');
    api.dismiss();
    expect(await screen.findByText('In progress')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(api.getSnapshot().state).toMatchObject({
      activeTourId: 'app/welcome',
      stepIndex: 1,
    });
    expect(await screen.findByText('location:/catalog')).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'Reset all tours' }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Reset all tours?')).toBeVisible();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(api.getProgress('app/welcome')).toBeDefined();

    await userEvent.click(
      screen.getByRole('button', { name: 'Reset all tours' }),
    );
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Reset',
      }),
    );
    expect(await screen.findAllByText('New')).toHaveLength(2);
    expect(api.getProgress('app/welcome')).toBeUndefined();
    expect(api.getSnapshot().state.activeTourId).toBeUndefined();
  });

  it('shows an empty state without tours', async () => {
    const api = new DefaultGuidedTourApi({
      tours: [],
      storageApi: mockApis.storage(),
    });
    await renderPage(api);
    expect(screen.getByText('No guided tours are installed.')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Reset all tours' }),
    ).toBeDisabled();
  });
});
