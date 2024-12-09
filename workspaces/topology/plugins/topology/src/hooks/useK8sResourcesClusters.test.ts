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

import { kubernetesObject } from '../__fixtures__/kubernetesObject';
import { kubernetesObjectsWithError } from '../__fixtures__/kubernetesObjectWithError';
import { useK8sResourcesClusters } from './useK8sResourcesClusters';

describe('useAllWatchResources', () => {
  it('should return clusters and errors as empty if no resources found', () => {
    const k8sObjectsResponse = {
      loading: true,
      error: '',
    };
    const { result } = renderHook(() =>
      useK8sResourcesClusters(k8sObjectsResponse),
    );
    expect(result.current.clusters).toEqual([]);
    expect(result.current.errors).toEqual([]);
  });

  it('should return clusters and errors(if any) if resources are present', () => {
    let k8sObjectsResponse = {
      kubernetesObjects: kubernetesObject,
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result, rerender } = renderHook(() =>
      useK8sResourcesClusters(k8sObjectsResponse),
    );
    expect(result.current.clusters).toEqual(['minikube']);
    expect(result.current.errors).toEqual([[]]);

    k8sObjectsResponse = {
      kubernetesObjects: kubernetesObjectsWithError,
      loading: false,
      error: '',
    } as KubernetesObjects;
    rerender();
    expect(result.current.clusters).toEqual(['minikube']);
    expect(result.current.errors).toEqual([
      [{ errorType: 'FETCH_ERROR', message: 'Couldnt fetch resources' }],
    ]);
  });
});
