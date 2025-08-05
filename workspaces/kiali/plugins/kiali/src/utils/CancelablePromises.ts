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
export class CancelablePromise<T> {
  promise: Promise<T>;
  next?: CancelablePromise<T>;
  private hasCanceled = false;

  constructor(promise: Promise<T>) {
    this.promise = new Promise<T>((resolve, reject) => {
      promise.then(
        val => (this.hasCanceled ? reject({ isCanceled: true }) : resolve(val)),
        error =>
          this.hasCanceled ? reject({ isCanceled: true }) : reject(error),
      );
    });
  }

  cancel() {
    this.hasCanceled = true;
    if (this.next) {
      this.next.cancel();
    }
  }

  chain(mapper: (t: T) => Promise<T>): CancelablePromise<T> {
    // eslint-disable-next-line
    let last: CancelablePromise<T> = this;
    while (last.next) {
      last = last.next;
    }
    last.next = new CancelablePromise<T>(
      this.promise.then(t => (this.hasCanceled ? t : mapper(t))),
    );
    this.promise = last.next.promise;
    return last.next;
  }
}

export const makeCancelablePromise = <T>(
  promise: Promise<T>,
): CancelablePromise<T> => {
  return new CancelablePromise(promise);
};

export class PromisesRegistry {
  private promises: Map<string, CancelablePromise<any>> = new Map();

  register<T>(key: string, promise: Promise<T>): Promise<T> {
    const previous = this.promises.get(key);
    if (previous) {
      previous.cancel();
    }
    const cancelable = makeCancelablePromise(promise);
    this.promises.set(key, cancelable);
    return cancelable.promise;
  }

  registerChained<T>(
    key: string,
    initial: T,
    mapper: (t: T) => Promise<T>,
  ): Promise<T> {
    const previous = this.promises.get(key);
    if (previous) {
      previous.chain(mapper);
      return previous.promise;
    }
    const cancelable = new CancelablePromise(mapper(initial));
    this.promises.set(key, cancelable);
    return cancelable.promise;
  }
  async waitAll() {
    await Promise.all(this.promises);
  }

  registerAll<T>(key: string, promises: Promise<T>[]): Promise<T[]> {
    return this.register(key, Promise.all(promises));
  }

  cancelAll() {
    this.promises.forEach(promise => promise.cancel());
    this.promises.clear();
  }

  cancel(key: string) {
    const previous = this.promises.get(key);
    if (previous) {
      previous.cancel();
      this.promises.delete(key);
    }
  }

  has(key: string): boolean {
    return this.promises.has(key);
  }
}
