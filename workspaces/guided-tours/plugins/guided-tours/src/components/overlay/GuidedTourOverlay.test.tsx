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
import { identityApiRef } from '@backstage/frontend-plugin-api';
import {
  mockApis,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import {
  GuidedTour,
  guidedTourApiRef,
} from '@backstage-community/plugin-guided-tours-react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { DefaultGuidedTourApi } from '../../api/DefaultGuidedTourApi';
import { GuidedTourOverlay } from './GuidedTourOverlay';

const welcome: GuidedTour = {
  id: 'app/welcome',
  title: 'Welcome',
  autoStart: 'login',
  completeRoute: '/done',
  steps: [
    { id: 'intro', title: 'Hi 👋', content: 'Centered step' },
    {
      id: 'target',
      title: 'The button',
      target: 'demo.button',
      content: 'Anchored step',
      route: '/page',
    },
    {
      id: 'click',
      title: 'Click it',
      target: 'demo.button',
      advanceOn: 'click',
      content: 'Click through',
    },
  ],
};

const catalog: GuidedTour = {
  id: 'catalog/intro',
  title: 'Catalog',
  autoStart: { route: '/catalog' },
  steps: [
    {
      id: 'gone',
      target: 'missing',
      targetTimeoutMs: 20,
      onMissingTarget: 'skip',
      content: 'Skipped',
    },
    {
      id: 'center',
      target: 'missing-too',
      targetTimeoutMs: 20,
      content: 'Centered fallback',
    },
  ],
};

function Location() {
  return <span>location:{useLocation().pathname}</span>;
}

async function renderOverlay(options: {
  api: DefaultGuidedTourApi;
  path?: string;
  signedIn?: boolean;
}) {
  const identityApi = mockApis.identity();
  if (options.signedIn === false) {
    identityApi.getBackstageIdentity = () => new Promise(() => {});
  }
  const result = await renderInTestApp(
    <TestApiProvider
      apis={[
        [guidedTourApiRef, options.api],
        [identityApiRef, identityApi],
      ]}
    >
      <GuidedTourOverlay />
      <Location />
      <Routes>
        <Route
          path="/page"
          element={<button data-guided-tour="demo.button">Demo</button>}
        />
        <Route path="*" element={null} />
      </Routes>
    </TestApiProvider>,
    { initialRouteEntries: [options.path ?? '/'] },
  );
  return result;
}

describe('GuidedTourOverlay', () => {
  it('stays idle before sign-in and when auto-start is off', async () => {
    const off = new DefaultGuidedTourApi({
      tours: [welcome],
      storageApi: mockApis.storage(),
      autoStart: false,
    });
    await renderOverlay({ api: off });
    const anon = new DefaultGuidedTourApi({
      tours: [welcome],
      storageApi: mockApis.storage(),
    });
    await renderOverlay({ api: anon, signedIn: false });
    await act(() => new Promise(r => setTimeout(r, 20)));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(off.getSnapshot().state.activeTourId).toBeUndefined();
    expect(anon.getSnapshot().state.activeTourId).toBeUndefined();
  });

  it('plays the login tour: centered, anchored, click-through, previous and done', async () => {
    const api = new DefaultGuidedTourApi({
      tours: [welcome],
      storageApi: mockApis.storage(),
    });
    await renderOverlay({ api });

    const intro = await screen.findByRole('dialog', { name: 'Hi 👋' });
    expect(intro).toBeVisible();
    expect(screen.getByText('Step 1 of 3')).toBeVisible();
    expect(screen.queryByTestId('guided-tour-spotlight')).toBeNull();

    // step 2 navigates to its route, waits for the target and anchors to it
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('location:/page')).toBeVisible();
    expect(
      await screen.findByRole('dialog', { name: 'The button' }),
    ).toBeVisible();
    expect(screen.getByTestId('guided-tour-spotlight')).toBeVisible();

    // previous goes back to the centered step
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(await screen.findByRole('dialog', { name: 'Hi 👋' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('dialog', { name: 'The button' });

    // the click-through step advances when the element itself is clicked
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(
      await screen.findByRole('dialog', { name: 'Click it' }),
    ).toBeVisible();
    expect(
      screen.getByText('Click the highlighted element to continue.'),
    ).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Demo' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(api.getProgress('app/welcome')).toMatchObject({
      status: 'completed',
    });
    expect(screen.getByText('location:/done')).toBeVisible();
    await waitFor(() => expect(api.getSnapshot().onboarded).toBe(true));
  });

  it('resumes an in-progress tour and closes on Escape', async () => {
    const storageApi = mockApis.storage();
    const first = new DefaultGuidedTourApi({ tours: [welcome], storageApi });
    first.start('app/welcome');
    first.next();
    await act(() => new Promise(r => setTimeout(r, 0)));

    const api = new DefaultGuidedTourApi({ tours: [welcome], storageApi });
    await renderOverlay({ api, path: '/page' });
    expect(
      await screen.findByRole('dialog', { name: 'The button' }),
    ).toBeVisible();
    expect(screen.getByText('Step 2 of 3')).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(api.getProgress('app/welcome')).toMatchObject({
      status: 'dismissed',
      stepIndex: 1,
    });
  });

  it('starts route tours on first visit, skips missing targets and centers the rest', async () => {
    const api = new DefaultGuidedTourApi({
      tours: [catalog],
      storageApi: mockApis.storage(),
    });
    await renderOverlay({ api, path: '/catalog' });
    // the first step is skipped as its target never shows up, the second is
    // shown centered instead
    expect(await screen.findByText('Step 2 of 2')).toBeVisible();
    expect(screen.getByRole('dialog', { name: 'Catalog' })).toBeVisible();
    expect(screen.getByText('Centered fallback')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Close tour' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(api.getProgress('catalog/intro')).toMatchObject({
      status: 'dismissed',
    });
  });
});
