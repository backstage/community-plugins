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
  StorageApi,
  StorageValueSnapshot,
} from '@backstage/frontend-plugin-api';
import { JsonValue } from '@backstage/types';
import { ProgressStore } from './progressStore';

/**
 * A storage that, like the user-settings storage, notifies observers with the
 * written value *before* the write promise resolves, and resolves on demand.
 */
function slowStorage() {
  const values = new Map<string, JsonValue>();
  const observers = new Map<
    string,
    Set<(s: StorageValueSnapshot<JsonValue>) => void>
  >();
  const resolvers: Array<() => void> = [];
  const notify = (key: string) => {
    const snapshot: StorageValueSnapshot<JsonValue> = values.has(key)
      ? { key, presence: 'present', value: values.get(key)! }
      : { key, presence: 'absent' };
    observers.get(key)?.forEach(o => o(snapshot));
  };
  const api: StorageApi = {
    forBucket: () => api,
    snapshot: key =>
      values.has(key)
        ? ({ key, presence: 'present', value: values.get(key) } as any)
        : { key, presence: 'absent' },
    observe$: key =>
      ({
        subscribe: (observer: any) => {
          const set = observers.get(key) ?? new Set();
          set.add(observer.next);
          observers.set(key, set);
          return { unsubscribe: () => set.delete(observer.next) };
        },
      } as any),
    set: (key, value) =>
      new Promise<void>(resolve => {
        values.set(key, value);
        notify(key);
        resolvers.push(resolve);
      }),
    remove: key =>
      new Promise<void>(resolve => {
        values.delete(key);
        notify(key);
        resolvers.push(resolve);
      }),
  };
  return { api, flush: () => resolvers.splice(0).forEach(r => r()) };
}

const progress = (status: 'dismissed' | 'in-progress') => ({
  status,
  stepIndex: 0,
  version: 1,
  updatedAt: 'now',
});

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('ProgressStore', () => {
  it('keeps the optimistic state while its own writes are in flight', async () => {
    const { api, flush } = slowStorage();
    const store = new ProgressStore({ storage: api, tourIds: ['a'] });

    const dismissed = store.setProgress('a', progress('dismissed'));
    const cleared = store.clearProgress('a');
    expect(store.getSnapshot().progress.a).toBeUndefined();

    // let the queued set() run: it echoes "dismissed" before it resolves,
    // which must not undo the clear queued right after it
    await tick();
    expect(store.getSnapshot().progress.a).toBeUndefined();
    flush();
    await dismissed;
    await tick();
    flush();
    await cleared;
    expect(store.getSnapshot().progress.a).toBeUndefined();
    expect(api.snapshot('tour/a').presence).toBe('absent');
  });

  it('applies storage changes once nothing is pending', async () => {
    const { api, flush } = slowStorage();
    const store = new ProgressStore({ storage: api, tourIds: ['a'] });
    const write = store.setProgress('a', progress('in-progress'));
    await tick();
    flush();
    await write;
    // a change from elsewhere (another tab) is picked up
    const external = api.set('tour/a', progress('dismissed') as any);
    flush();
    await external;
    expect(store.getSnapshot().progress.a).toMatchObject({
      status: 'dismissed',
    });
  });

  it('ignores malformed values, swallows write errors and can be destroyed', async () => {
    const { api, flush } = slowStorage();
    await Promise.all([
      (() => {
        const w = api.set('tour/a', { bogus: true } as any);
        flush();
        return w;
      })(),
      (() => {
        const w = api.set('onboarded', true);
        flush();
        return w;
      })(),
    ]);
    const store = new ProgressStore({ storage: api, tourIds: ['a', 'b'] });
    expect(store.getSnapshot()).toMatchObject({
      ready: true,
      onboarded: true,
      progress: {},
    });

    const listener = jest.fn();
    store.subscribe(listener);
    const originalSet = api.set;
    api.set = () => Promise.reject(new Error('offline'));
    await expect(
      store.setProgress('b', progress('in-progress')),
    ).resolves.toBeUndefined();
    expect(store.getSnapshot().progress.b).toMatchObject({
      status: 'in-progress',
    });
    expect(listener).toHaveBeenCalled();

    const cleared = store.clearAll();
    await tick();
    flush();
    await cleared;
    expect(store.getSnapshot()).toMatchObject({
      onboarded: false,
      progress: {},
    });

    api.set = originalSet;
    listener.mockClear();
    store.destroy();
    const external = api.set('onboarded', true);
    flush();
    await external;
    expect(listener).not.toHaveBeenCalled();
  });
});
