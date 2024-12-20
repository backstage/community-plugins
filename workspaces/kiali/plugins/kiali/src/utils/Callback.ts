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
import { useEffect, useRef, useState } from 'react';

type CallBackType<T> = (updatedValue: T) => void;

type SetStateType<T> = T | ((prev: T) => T);

type RetType = <T>(
  initialValue: T | (() => T),
) => [T, (newValue: SetStateType<T>, callback?: CallBackType<T>) => void];

const useCallbackState: RetType = <T>(initialValue: T | (() => T)) => {
  const [state, _setState] = useState<T>(initialValue);
  const callbackQueue = useRef<CallBackType<T>[]>([]);

  useEffect(() => {
    callbackQueue.current.forEach(cb => cb(state));
    callbackQueue.current = [];
  }, [state]);

  const setState = (newValue: SetStateType<T>, callback?: CallBackType<T>) => {
    _setState(newValue);
    if (callback && typeof callback === 'function') {
      callbackQueue.current.push(callback);
    }
  };
  return [state, setState];
};

export default useCallbackState;
