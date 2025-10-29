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

import { renderHook, waitFor } from '@testing-library/react';

import { useKubernetesObjects } from '@backstage/plugin-kubernetes-react';

import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { kubernetesObjects } from '../__fixtures__/kubernetesObject';
import { ModelsPlural } from '../models';
import { useTektonObjectsResponse } from './useTektonObjectsResponse';

const watchedResources = [ModelsPlural.pipelineruns, ModelsPlural.taskruns];

jest.mock('@backstage/plugin-kubernetes-react', () => ({
  useKubernetesObjects: jest.fn(),
}));

jest.mock('./useDeepCompareMemoize', () => ({
  useDeepCompareMemoize: (val: any) => val,
}));

jest.mock('./useDebounceCallback', () => ({
  useDebounceCallback: (val: any) => jest.fn(val),
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

const watchResourcesData = {
  pipelineruns: {
    data: mockKubernetesPlrResponse.pipelineruns,
  },
};

describe('useTektonObjectResponse', () => {
  it('should return k8sResourcesContextData', async () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects,
      loading: false,
      error: '',
    });
    const { result, rerender } = renderHook(() =>
      useTektonObjectsResponse(watchedResources),
    );
    rerender();
    await waitFor(() => {
      expect(result.current.watchResourcesData).toEqual(watchResourcesData);
      expect(result.current.clusters).toEqual(['minikube', 'ocp']);
      expect(result.current.selectedClusterErrors).toEqual([]);
    });
  });

  it('should be able to select a cluster and return data accordingly', async () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects,
      loading: false,
      error: '',
    });
    const { result } = renderHook(() =>
      useTektonObjectsResponse(watchedResources),
    );
    expect(result.current.selectedCluster).toEqual(0);
    act(() => {
      result.current.setSelectedCluster(1);
    });
    await waitFor(() => {
      expect(result.current.watchResourcesData).toEqual({});
      expect(result.current.clusters).toEqual(['minikube', 'ocp']);
      expect(result.current.selectedClusterErrors).toEqual([]);
      expect(result.current.selectedCluster).toEqual(1);
    });
  });

  it('should return responseError with loaded if unable to fetch data', async () => {
    mockUseKubernetesObjects.mockReturnValue({
      error:
        'getaddrinfo ENOTFOUND api.rhoms-4.13-052404.dev.openshiftappsvc.org',
    });
    const { result } = renderHook(() =>
      useTektonObjectsResponse(watchedResources),
    );
    await waitFor(() => {
      expect(result.current.watchResourcesData).toBeUndefined();
      expect(result.current.clusters).toEqual([]);
      expect(result.current.selectedClusterErrors).toEqual([]);
      expect(result.current.loaded).toEqual(true);
      expect(result.current.responseError).toEqual(
        'getaddrinfo ENOTFOUND api.rhoms-4.13-052404.dev.openshiftappsvc.org',
      );
    });
  });
});
