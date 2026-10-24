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
import { TestApiProvider } from '@backstage/frontend-test-utils';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import {
  GuidedTour,
  GuidedTourApi,
  GuidedTourSnapshot,
  guidedTourApiRef,
} from '../index';
import { RestartTourAction } from '../components/RestartTourAction';
import { useGuidedTour } from './useGuidedTour';

const tour: GuidedTour = {
  id: 'example/intro',
  title: 'Intro',
  steps: [{ id: 's1', content: 'one' }],
};

/** A minimal api whose snapshot can be swapped from the test. */
function fakeApi(active?: string) {
  const listeners = new Set<() => void>();
  let snapshot: GuidedTourSnapshot = {
    ready: true,
    onboarded: true,
    progress: {},
    state: { activeTourId: active, stepIndex: 0, queue: [] },
  };
  const api = {
    getTour: (id: string) => (id === tour.id ? tour : undefined),
    getProgress: jest.fn(() => undefined),
    start: jest.fn(),
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getSnapshot: () => snapshot,
    setActive(id?: string) {
      snapshot = {
        ...snapshot,
        state: { ...snapshot.state, activeTourId: id },
      };
      listeners.forEach(l => l());
    },
  };
  return api as unknown as GuidedTourApi & typeof api;
}

function Probe(props: { id: string }) {
  const result = useGuidedTour(props.id);
  return (
    <>
      <span>available:{String(result.available)}</span>
      <span>active:{String(result.active)}</span>
      <button onClick={() => result.start({ force: true })}>start</button>
    </>
  );
}

const withApi = (api: GuidedTourApi | undefined, children: ReactNode) =>
  api ? (
    <TestApiProvider apis={[[guidedTourApiRef, api]]}>
      {children}
    </TestApiProvider>
  ) : (
    <TestApiProvider apis={[]}>{children}</TestApiProvider>
  );

describe('useGuidedTour', () => {
  it('is a no-op without the guided tour plugin', async () => {
    render(withApi(undefined, <Probe id="example/intro" />));
    expect(screen.getByText('available:false')).toBeInTheDocument();
    expect(screen.getByText('active:false')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'start' }));
  });

  it('reports availability and activity and starts the tour', async () => {
    const api = fakeApi();
    render(
      withApi(
        api,
        <>
          <Probe id="example/intro" />
          <Probe id="unknown" />
        </>,
      ),
    );
    expect(screen.getByText('available:true')).toBeInTheDocument();
    expect(screen.getByText('available:false')).toBeInTheDocument();
    expect(screen.getAllByText('active:false')).toHaveLength(2);

    await userEvent.click(screen.getAllByRole('button', { name: 'start' })[0]);
    expect(api.start).toHaveBeenCalledWith('example/intro', { force: true });

    act(() => api.setActive('example/intro'));
    expect(screen.getByText('active:true')).toBeInTheDocument();
  });
});

describe('RestartTourAction', () => {
  it('renders nothing for an unknown tour and restarts a known one', async () => {
    const api = fakeApi();
    const { rerender } = render(
      withApi(api, <RestartTourAction tourId="unknown" />),
    );
    expect(screen.queryByRole('button')).toBeNull();

    rerender(
      withApi(
        api,
        <RestartTourAction tourId="example/intro" label="Show me around" />,
      ),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Show me around' }),
    );
    expect(api.start).toHaveBeenCalledWith('example/intro', { force: true });
  });

  it('uses the default label', () => {
    render(withApi(fakeApi(), <RestartTourAction tourId="example/intro" />));
    expect(
      screen.getByRole('button', { name: 'Restart the guided tour' }),
    ).toBeInTheDocument();
  });
});
