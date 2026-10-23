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
import { mockApis } from '@backstage/frontend-test-utils';
import { GuidedTour } from '@internal/backstage-plugin-guided-tour-react';
import { DefaultGuidedTourApi, selectLoginTours } from './DefaultGuidedTourApi';

const tour = (id: string, extra: Partial<GuidedTour> = {}): GuidedTour => ({
  id,
  title: id,
  steps: [
    { id: 's1', content: 'one' },
    { id: 's2', content: 'two' },
    { id: 's3', content: 'three' },
  ],
  ...extra,
});

const flush = () => new Promise(r => setTimeout(r, 0));

describe('DefaultGuidedTourApi', () => {
  it('becomes ready once storage reported every key', () => {
    const api = new DefaultGuidedTourApi({
      tours: [tour('a')],
      storageApi: mockApis.storage(),
    });
    expect(api.getSnapshot().ready).toBe(true);
    expect(api.getSnapshot().onboarded).toBe(false);
  });

  it('sorts tours by order then title', () => {
    const api = new DefaultGuidedTourApi({
      tours: [tour('b'), tour('c', { order: 1 }), tour('a')],
      storageApi: mockApis.storage(),
    });
    expect(api.getTours().map(t => t.id)).toEqual(['c', 'a', 'b']);
  });

  it('walks through steps and saves progress on every move', async () => {
    const api = new DefaultGuidedTourApi({
      tours: [tour('a')],
      storageApi: mockApis.storage(),
    });
    api.start('a');
    expect(api.getSnapshot().state).toMatchObject({
      activeTourId: 'a',
      stepIndex: 0,
    });
    api.next();
    expect(api.getProgress('a')).toMatchObject({
      status: 'in-progress',
      stepIndex: 1,
    });
    api.previous();
    expect(api.getSnapshot().state.stepIndex).toBe(0);
    api.next();
    api.next();
    api.next(); // last step -> complete
    await flush();
    expect(api.getSnapshot().state.activeTourId).toBeUndefined();
    expect(api.getProgress('a')).toMatchObject({ status: 'completed' });
  });

  it('resumes an in-progress tour and refuses a dismissed one unless forced', () => {
    const api = new DefaultGuidedTourApi({
      tours: [tour('a')],
      storageApi: mockApis.storage(),
    });
    api.start('a');
    api.next();
    api.start('b'); // unknown, ignored
    api.start('a');
    expect(api.getSnapshot().state.stepIndex).toBe(1);
    api.dismiss();
    expect(api.getProgress('a')).toMatchObject({ status: 'dismissed' });
    api.start('a');
    expect(api.getSnapshot().state.activeTourId).toBeUndefined();
    api.start('a', { force: true });
    expect(api.getSnapshot().state).toMatchObject({
      activeTourId: 'a',
      stepIndex: 0,
    });
  });

  it('ignores progress of an older tour version', () => {
    const storageApi = mockApis.storage();
    const api1 = new DefaultGuidedTourApi({ tours: [tour('a')], storageApi });
    api1.start('a');
    api1.dismiss();
    const api2 = new DefaultGuidedTourApi({
      tours: [tour('a', { version: 2 })],
      storageApi,
    });
    expect(api2.getProgress('a')).toBeUndefined();
  });

  it('plays a queue and marks onboarded at the end', async () => {
    const api = new DefaultGuidedTourApi({
      tours: [tour('a'), tour('b')],
      storageApi: mockApis.storage(),
    });
    api.startQueue(['a', 'b'], { onboarding: true });
    expect(api.getSnapshot().state).toMatchObject({
      activeTourId: 'a',
      queue: ['b'],
    });
    api.next();
    api.next();
    api.next();
    expect(api.getSnapshot().state).toMatchObject({
      activeTourId: 'b',
      queue: [],
    });
    expect(api.getSnapshot().onboarded).toBe(false);
    api.dismiss();
    await flush();
    expect(api.getSnapshot().onboarded).toBe(true);
    expect(api.getProgress('a')).toMatchObject({ status: 'completed' });
    expect(api.getProgress('b')).toMatchObject({ status: 'dismissed' });
  });

  it('resets all progress including the onboarded flag', async () => {
    const api = new DefaultGuidedTourApi({
      tours: [tour('a')],
      storageApi: mockApis.storage(),
    });
    api.startQueue(['a'], { onboarding: true });
    api.dismiss();
    await flush();
    expect(api.getSnapshot().onboarded).toBe(true);
    await api.resetProgress();
    expect(api.getSnapshot().onboarded).toBe(false);
    expect(api.getProgress('a')).toBeUndefined();
  });
});

describe('selectLoginTours', () => {
  const tours = [
    tour('manual'),
    tour('login-b', { autoStart: 'login', order: 2 }),
    tour('login-a', { autoStart: 'login', order: 1 }),
    tour('route', { autoStart: { route: '/x' } }),
  ];
  const progress = (id: string, status: 'completed' | 'dismissed') => ({
    [id]: { status, stepIndex: 0, version: 1, updatedAt: '' },
  });

  it('queues all login tours on first login', () => {
    expect(selectLoginTours({ tours, progress: {}, onboarded: false })).toEqual(
      ['login-a', 'login-b'],
    );
  });

  it('only returns tours new to an onboarded user', () => {
    expect(
      selectLoginTours({
        tours,
        progress: { ...progress('login-a', 'completed') },
        onboarded: true,
      }),
    ).toEqual(['login-b']);
  });

  it('returns nothing when everything was seen', () => {
    expect(
      selectLoginTours({
        tours,
        progress: {
          ...progress('login-a', 'completed'),
          ...progress('login-b', 'dismissed'),
        },
        onboarded: true,
      }),
    ).toEqual([]);
  });
});
