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
import { mockKubernetesResponse } from '../__fixtures__/1-deployments';
import { getTopologyEdgeItems } from './transform-utils';

describe('data-transformer', () => {
  it('should return edges for provided resource and workload resources if exists', () => {
    const mockDeploymentData = {
      ...mockKubernetesResponse.deployments[1],
      metadata: {
        ...mockKubernetesResponse.deployments[1].metadata,
        annotations: {
          ...mockKubernetesResponse.deployments[1].metadata.annotations,
          'app.openshift.io/connects-to': JSON.stringify([
            {
              apiVersion: 'apps/v1',
              kind: 'Deployment',
              name: 'hello-world-45',
            },
          ]),
        },
      },
    };
    const mockWorkloadResourcesData = [
      mockDeploymentData,
      mockKubernetesResponse.deployments[2],
    ];
    const edgeItems = getTopologyEdgeItems(
      mockDeploymentData as any,
      mockWorkloadResourcesData as any,
    );
    expect(edgeItems).toHaveLength(1);
  });

  it('should not return edges for provided resource and workload resources if not exists', () => {
    const edgeItems = getTopologyEdgeItems(
      mockKubernetesResponse.deployments[0] as any,
      mockKubernetesResponse.deployments as any,
    );
    expect(edgeItems).toHaveLength(0);
  });
});
