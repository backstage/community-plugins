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
import { act } from 'react';

import { renderHook } from '@testing-library/react';

import { useKubernetesObjects } from '@backstage/plugin-kubernetes-react';

import { watchResourcesData } from '../__fixtures__/k8sResourcesContextData';
import { kubernetesObject } from '../__fixtures__/kubernetesObject';
import { ModelsPlural } from '../models';
import { useK8sObjectsResponse } from './useK8sObjectsResponse';

const watchedResources = [
  ModelsPlural.deployments,
  ModelsPlural.pods,
  ModelsPlural.services,
  ModelsPlural.replicasets,
];

jest.mock('@backstage/plugin-kubernetes-react', () => ({
  useKubernetesObjects: jest.fn(),
}));

const mockUseKubernetesObjects = useKubernetesObjects as jest.Mock;

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: {
      metadata: {
        name: 'test',
      },
    },
  }),
}));

describe('useK8sObjectsResponse', () => {
  it('should return k8sResourcesContextData', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: kubernetesObject,
      loading: false,
      error: '',
    });
    const { result } = renderHook(() =>
      useK8sObjectsResponse(watchedResources),
    );
    expect(result.current.watchResourcesData).toEqual(watchResourcesData);
    expect(result.current.clusters).toEqual(['minikube']);
    expect(result.current.selectedClusterErrors).toEqual([]);
  });

  it('should return k8sResourcesContextData with empty clusters if it does not exist', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: { items: [] },
      loading: false,
      error: '',
    });
    const { result } = renderHook(() =>
      useK8sObjectsResponse(watchedResources),
    );
    expect(result.current.watchResourcesData).toEqual({});
    expect(result.current.clusters).toEqual([]);
    expect(result.current.selectedClusterErrors).toEqual([]);
  });

  it('should return k8sResourcesContextData with 2 clusters', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: {
        items: [{ cluster: { name: 'OCP' } }, kubernetesObject.items[0]],
      },
      loading: false,
      error: '',
    });
    const { result } = renderHook(() =>
      useK8sObjectsResponse(watchedResources),
    );
    expect(result.current.watchResourcesData).toEqual({});
    expect(result.current.clusters).toEqual(['OCP', 'minikube']);
    expect(result.current.selectedClusterErrors).toEqual([]);
    expect(result.current.selectedCluster).toEqual(0);
  });

  it('should return k8sResourcesContextData with 2 clusters and update selectedCluster', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: {
        items: [{ cluster: { name: 'OCP' } }, kubernetesObject.items[0]],
      },
      loading: false,
      error: '',
    });
    const { result } = renderHook(() =>
      useK8sObjectsResponse(watchedResources),
    );
    expect(result.current.watchResourcesData).toEqual({});
    expect(result.current.clusters).toEqual(['OCP', 'minikube']);
    expect(result.current.selectedClusterErrors).toEqual([]);
    expect(result.current.selectedCluster).toEqual(0);

    act(() => {
      result.current.setSelectedCluster(1);
    });

    expect(result.current.watchResourcesData).toEqual(watchResourcesData);
    expect(result.current.clusters).toEqual(['OCP', 'minikube']);
    expect(result.current.selectedClusterErrors).toEqual([]);
    expect(result.current.selectedCluster).toEqual(1);
  });
});
