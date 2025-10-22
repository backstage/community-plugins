/*
 * Copyright 2025 The Backstage Authors
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
import { HelmRelease, OCIRepository } from '../objects';
import { automationLastUpdated, findVerificationCondition } from './utils';

describe('automationLastUpdated', () => {
  it('returns an empty string when no conditions', () => {
    const latest = automationLastUpdated(
      new HelmRelease({
        payload:
          '{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"annotations":{"metadata.weave.works/test":"value"},"creationTimestamp":"2023-05-25T14:14:46Z","finalizers":["finalizers.fluxcd.io"],"generation":5,"name":"normal","namespace":"default","resourceVersion":"1","uid":"82231842-2224-4f22-8576-5babf08d746d"}}',
      }),
    );

    expect(latest).toEqual('');
  });

  it('returns the timestamp of the first Ready condition', () => {
    const latest = automationLastUpdated(
      new HelmRelease({
        payload:
          '{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"annotations":{"metadata.weave.works/test":"value"},"creationTimestamp":"2023-05-25T14:14:46Z","finalizers":["finalizers.fluxcd.io"],"generation":5,"name":"normal","namespace":"default","resourceVersion":"1","uid":"82231842-2224-4f22-8576-5babf08d746d"},"status":{"conditions":[{"lastTransitionTime":"2023-05-25T15:03:33Z","message":"pulled \'test\' chart with version \'1.0.0\'","observedGeneration":1,"reason":"ChartPullSucceeded","status":"True","type":"Ready"}]}}',
      }),
    );

    expect(latest).toEqual('2023-05-25T15:03:33Z');
  });

  it('returns the timestamp even when the condition is not Ready', () => {
    const latest = automationLastUpdated(
      new HelmRelease({
        payload:
          '{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"annotations":{"metadata.weave.works/test":"value"},"creationTimestamp":"2023-05-25T14:14:46Z","finalizers":["finalizers.fluxcd.io"],"generation":5,"name":"normal","namespace":"default","resourceVersion":"1","uid":"82231842-2224-4f22-8576-5babf08d746d"},"status":{"conditions":[{"lastTransitionTime":"2023-05-25T15:03:33Z","message":"pulled \'test\' chart with version \'1.0.0\'","observedGeneration":1,"reason":"ChartPullSucceeded","status":"False","type":"Ready"}]}}',
      }),
    );

    expect(latest).toEqual('2023-05-25T15:03:33Z');
  });
});

describe('findVerificationCondition', () => {
  it('returns undefined with no verified conditions', () => {
    const condition = findVerificationCondition(
      new OCIRepository({
        payload: `{"apiVersion":"source.toolkit.fluxcd.io/v1beta2","kind":"OCIRepository","metadata":{"creationTimestamp":"2023-06-23T07:50:47Z","finalizers":["finalizers.fluxcd.io"],"generation":1,"name":"podinfo","namespace":"default","resourceVersion":"143955","uid":"1ec54278-ed2d-4f31-9bb0-39dc7163730e"},"spec":{"interval":"5m","provider":"generic","timeout":"60s","url":"oci://ghcr.io/stefanprodan/manifests/podinfo","verify":{"provider":"cosign"}},"status":{"artifact":{"digest":"sha256:62df151eb3714d9dfa943c7d88192d72466bffa268b25595f85530b793f77524","lastUpdateTime":"2023-06-23T07:50:53Z","metadata":{"org.opencontainers.image.created":"2023-05-03T14:30:58Z","org.opencontainers.image.revision":"6.3.6/073f1ec5aff930bd3411d33534e91cbe23302324","org.opencontainers.image.source":"https://github.com/stefanprodan/podinfo"},"path":"ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz","revision":"latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4","size":1071,"url":"http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz"},"conditions":[{"lastTransitionTime":"2023-06-23T07:50:53Z","message":"stored artifact for digest 'latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'","observedGeneration":1,"reason":"Succeeded","status":"True","type":"Ready"},{"lastTransitionTime":"2023-06-23T07:50:53Z","message":"stored artifact for digest 'latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'","observedGeneration":1,"reason":"Succeeded","status":"True","type":"ArtifactInStorage"}],"observedGeneration":1,"url":"http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/latest.tar.gz"}}`,
      }),
    );

    expect(condition).toBeUndefined();
  });

  it('returns the condition with a verified condition', () => {
    const condition = findVerificationCondition(
      new OCIRepository({
        payload: `{"apiVersion":"source.toolkit.fluxcd.io/v1beta2","kind":"OCIRepository","metadata":{"creationTimestamp":"2023-06-23T07:50:47Z","finalizers":["finalizers.fluxcd.io"],"generation":1,"name":"podinfo","namespace":"default","resourceVersion":"143955","uid":"1ec54278-ed2d-4f31-9bb0-39dc7163730e"},"spec":{"interval":"5m","provider":"generic","timeout":"60s","url":"oci://ghcr.io/stefanprodan/manifests/podinfo","verify":{"provider":"cosign"}},"status":{"artifact":{"digest":"sha256:62df151eb3714d9dfa943c7d88192d72466bffa268b25595f85530b793f77524","lastUpdateTime":"2023-06-23T07:50:53Z","metadata":{"org.opencontainers.image.created":"2023-05-03T14:30:58Z","org.opencontainers.image.revision":"6.3.6/073f1ec5aff930bd3411d33534e91cbe23302324","org.opencontainers.image.source":"https://github.com/stefanprodan/podinfo"},"path":"ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz","revision":"latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4","size":1071,"url":"http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz"},"conditions":[{"lastTransitionTime":"2023-06-23T07:50:53Z","message":"stored artifact for digest 'latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'","observedGeneration":1,"reason":"Succeeded","status":"True","type":"Ready"},{"lastTransitionTime":"2023-06-23T07:50:53Z","message":"stored artifact for digest 'latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'","observedGeneration":1,"reason":"Succeeded","status":"True","type":"ArtifactInStorage"},{"lastTransitionTime":"2023-06-23T07:50:52Z","message":"verified signature of revision latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4","observedGeneration":1,"reason":"Succeeded","status":"True","type":"SourceVerified"}],"observedGeneration":1,"url":"http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/latest.tar.gz"}}`,
      }),
    );

    expect(condition).toEqual({
      message:
        'verified signature of revision latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4',
      reason: 'Succeeded',
      status: 'True',
      timestamp: '2023-06-23T07:50:52Z',
      type: 'SourceVerified',
    });
  });
});
