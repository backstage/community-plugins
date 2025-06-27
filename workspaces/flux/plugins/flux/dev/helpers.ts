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
import { DateTime } from 'luxon';
import { Condition } from '../src/objects';
import * as verifiedOCIRepository from '../src/__fixtures__/verified_oci_repository.json';
import * as unverifiedOCIRepository from '../src/__fixtures__/unverified_oci_repository.json';
import * as ociRepository from '../src/__fixtures__/oci_repository.json';
import * as verifiedGitRepository from '../src/__fixtures__/verified_git_repository.json';
import * as unverifiedGitRepository from '../src/__fixtures__/unverified_git_repository.json';
import * as gitRepository from '../src/__fixtures__/git_repository.json';
import * as kustomization from '../src/__fixtures__/kustomization.json';
import * as helmRepository from '../src/__fixtures__/helm_repository.json';

const randomInt = (max: number) => Math.floor(Math.random() * max);

type RepoOpts = {
  verify?: boolean;
  verified?: boolean;
  pending?: boolean;
  ready?: boolean;
};

const copy = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};

const removeVerifiedCondition = (conditions: Condition[]): Condition[] =>
  copy(conditions).filter((cond: Condition) => cond.type !== 'SourceVerified');

const applyReadyCondition = (
  status: boolean,
  conditions: Condition[],
): Condition[] => {
  const ready = conditions.find(cond => cond.type === 'Ready');
  if (ready === undefined) {
    return conditions;
  }

  ready.status = Boolean(status) === true ? 'True' : 'False';
  const result = conditions.filter((cond: Condition) => cond.type !== 'Ready');
  result.unshift(ready);

  return result;
};

const configureFixture = (
  name: string,
  url: string,
  fixture: any,
  verifiedFixture: any,
  unverifiedFixture: any,
  opts?: RepoOpts,
) => {
  let result = copy(fixture);

  if (opts?.verify) {
    if (opts?.verified || opts?.pending) {
      result = copy(verifiedFixture);
    } else {
      result = copy(unverifiedFixture);
    }
  }

  if (opts?.verify && opts?.pending) {
    result.status.conditions = removeVerifiedCondition(
      result.status.conditions,
    );
  }

  if (opts?.ready !== undefined) {
    result.status.conditions = applyReadyCondition(
      opts.ready!,
      result.status.conditions,
    );
  }

  result.spec.url = url;
  result.metadata.name = name;
  result.status.conditions[0].lastTransitionTime = DateTime.now()
    .minus({ hours: randomInt(22) + 1 })
    .toISO()!;

  return result;
};

export const newTestOCIRepository = (
  name: string,
  url: string,
  opts?: RepoOpts,
) => {
  return configureFixture(
    name,
    url,
    ociRepository,
    verifiedOCIRepository,
    unverifiedOCIRepository,
    opts,
  );
};

export const newTestGitRepository = (
  name: string,
  url: string,
  opts?: RepoOpts,
) => {
  return configureFixture(
    name,
    url,
    gitRepository,
    verifiedGitRepository,
    unverifiedGitRepository,
    opts,
  );
};

export const newTestKustomization = (
  name: string,
  path: string,
  ready: boolean,
  suspend: boolean,
) => {
  const result = copy(kustomization);

  result.metadata.name = name;
  result.spec.path = path;

  result.metadata.name = name;
  result.spec.path = path;
  result.status.conditions = applyReadyCondition(
    ready,
    result.status.conditions,
  );
  result.spec.suspend = suspend;

  return result;
};

export const newTestHelmRepository = (
  name: string,
  url: string,
  ready: boolean = true,
  suspend: boolean,
) => {
  const result = copy(helmRepository);

  result.metadata.name = name;
  result.spec.url = url;
  result.status.conditions = applyReadyCondition(
    ready,
    result.status.conditions,
  );
  result.spec.suspend = suspend;

  return result;
};

export const newTestHelmRelease = (
  name: string,
  chart: string,
  version: string,
  ready: string = 'True',
  suspend: boolean,
) => {
  return {
    apiVersion: 'helm.toolkit.fluxcd.io/v2beta1',
    kind: 'HelmRelease',
    metadata: {
      annotations: {
        'metadata.weave.works/test': 'value',
      },
      creationTimestamp: '2023-05-25T14:14:46Z',
      finalizers: ['finalizers.fluxcd.io'],
      name: name,
      namespace: 'default',
    },
    spec: {
      suspend,
      interval: '5m',
      chart: {
        spec: {
          chart: chart,
          version: '45.x',
          sourceRef: {
            kind: 'HelmRepository',
            name: 'prometheus-community',
            namespace: 'default',
          },
          interval: '60m',
        },
      },
    },
    status: {
      conditions: [
        {
          lastTransitionTime: DateTime.now()
            .minus({ hours: randomInt(22) + 1 })
            .toISO(),
          message: 'Release reconciliation succeeded',
          reason: 'ReconciliationSucceeded',
          status: ready,
          type: 'Ready',
        },
        {
          lastTransitionTime: DateTime.now()
            .minus({ hours: randomInt(22) + 1 })
            .toISO(),
          message: 'Helm upgrade succeeded',
          reason: 'UpgradeSucceeded',
          status: 'True',
          type: 'Released',
        },
      ],
      helmChart: 'default/default-podinfo',
      lastAppliedRevision: version,
      lastAttemptedRevision: version,
      lastAttemptedValuesChecksum: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
      lastReleaseRevision: 6,
      observedGeneration: 12,
    },
  };
};

export const newTestImagePolicy = (
  name: string,
  policy: { [name: string]: { [name: string]: string } },
  imageRepositoryRef: string,
  latestImage: string,
  ready: string = 'True',
) => {
  return {
    apiVersion: 'image.toolkit.fluxcd.io/v1beta1',
    kind: 'ImagePolicy',
    metadata: {
      creationTimestamp: '2023-06-29T08:06:59Z',
      finalizers: ['finalizers.fluxcd.io'],
      generation: 2,
      labels: {
        'kustomize.toolkit.fluxcd.io/name': 'flux-system',
        'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
      },
      name,
      namespace: 'flux-system',
      resourceVersion: '13621',
      uid: '5009e51d-0fee-4f8e-9df1-7684c8aac4bd',
    },
    spec: {
      imageRepositoryRef: {
        name: imageRepositoryRef,
      },
      policy,
    },
    status: {
      conditions: [
        {
          lastTransitionTime: DateTime.now()
            .minus({ hours: randomInt(22) + 1 })
            .toISO(),
          message:
            'Applied revision: main@sha1:c933408394a3af8fa7208af8c9abf7fe430f99d4',
          observedGeneration: 1,
          reason: 'ReconciliationSucceeded',
          status: ready,
          type: 'Ready',
        },
      ],
      latestImage,
      observedGeneration: 2,
    },
  };
};

export const newTestFluxController = (
  name: string,
  namespace: string,
  labels: { [name: string]: string },
) => {
  return {
    apiVersion: 'meta.k8s.io/v1',
    kind: 'PartialObjectMetadata',
    metadata: {
      name,
      namespace,
      uid: 'b062d329-538d-4bb3-b4df-b2ac4b06dba8',
      resourceVersion: '1001263',
      generation: 1,
      creationTimestamp: '2023-10-19T16:34:14Z',
      labels,
      annotations: {
        'deployment.kubernetes.io/revision': '1',
      },
    },
  };
};
