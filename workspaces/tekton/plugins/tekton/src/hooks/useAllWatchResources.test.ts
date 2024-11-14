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
import { KubernetesObjects } from '@backstage/plugin-kubernetes-react';

import { renderHook } from '@testing-library/react';

import { kubernetesObjects } from '../__fixtures__/kubernetesObject';
import { ModelsPlural } from '../models';
import { useAllWatchResources } from './useAllWatchResources';

const watchedResources = [ModelsPlural.pipelineruns, ModelsPlural.taskruns];

describe('useAllWatchResources', () => {
  it('should return watchResourcesData as empty if no resources found', () => {
    const k8sObjectsResponse = {
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result } = renderHook(() =>
      useAllWatchResources(k8sObjectsResponse, 0, watchedResources),
    );
    expect(result.current).toEqual({});
  });

  it('should return watchResourcesData if resources are present', () => {
    const k8sObjectsResponse = {
      kubernetesObjects,
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result } = renderHook(() =>
      useAllWatchResources(k8sObjectsResponse, 0, watchedResources),
    );
    expect(result.current?.pipelineruns?.data).toHaveLength(5);
    expect(result.current?.taskruns).toBeUndefined();
  });

  it('should return watchResourcesData as empty if resources are present but it is not in in watchedResources', () => {
    const k8sObjectsResponse = {
      kubernetesObjects,
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result } = renderHook(() =>
      useAllWatchResources(k8sObjectsResponse, 0, []),
    );
    expect(result.current).toEqual({});
  });

  it('should update watchResourcesData as per API response', () => {
    let k8sObjectsResponse = {
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result, rerender } = renderHook(() =>
      useAllWatchResources(k8sObjectsResponse, 0, watchedResources),
    );
    expect(result.current).toEqual({});

    k8sObjectsResponse = {
      kubernetesObjects,
      loading: false,
      error: '',
    } as KubernetesObjects;
    rerender();
    expect(result.current?.pipelineruns?.data).toHaveLength(5);
  });
});
