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
import type { ClusterDetails } from '@backstage-community/plugin-ocm-common';

import { ManagedCluster, ManagedClusterInfo } from '../types';
import {
  getClaim,
  parseManagedCluster,
  parseNodeStatus,
  parseResources,
  parseUpdateInfo,
  translateOCMToResource,
  translateResourceToOCM,
} from './parser';

const FIXTURES_DIR = `${__dirname}/../../__fixtures__`;

describe('getClaim', () => {
  it('should extract a cluster claim value from a cluster object', () => {
    const cluster = {
      status: {
        clusterClaims: [
          {
            name: 'claim1',
            value: 'claim1_value',
          },
          {
            name: 'claim2',
            value: 'claim2_value',
          },
          {
            name: 'claim3',
            value: 'claim3_value',
          },
        ],
      },
    };

    expect(getClaim(cluster, 'claim2')).toStrictEqual('claim2_value');
  });

  it("should return undefined when cluster claim doesn't exist", () => {
    const cluster: any = {
      status: {
        clusterClaims: [
          {
            name: 'claim1',
            value: 'claim1_value',
          },
          {
            name: 'claim3',
            value: 'claim3_value',
          },
        ],
      },
    };

    const result = getClaim(cluster, 'claim2');

    expect(result).toEqual('');
  });

  it('should return empty string when clusterClaims is undefined', () => {
    const cluster: any = {
      status: {
        clusterClaims: undefined,
      },
    };

    const result = getClaim(cluster, 'any');

    expect(result).toEqual('');
  });
});

describe('parseResources', () => {
  it('should parse resources correctly', () => {
    const resources = {
      cpu: '94500m',
      memory: '656645580Ki',
      pods: '750',
    };

    const expected = {
      cpuCores: 94.5,
      memorySize: '656645580Ki',
      numberOfPods: 750,
    };

    expect(parseResources(resources)).toStrictEqual(expected);
  });

  it('should parse resources even if some resource types are unavailable', () => {
    const resources = {
      cpu: '94500m',
      memory: '656645580Ki',
    };

    const expected = {
      cpuCores: 94.5,
      memorySize: '656645580Ki',
      numberOfPods: undefined,
    };

    expect(parseResources(resources)).toStrictEqual(expected);
  });
});

describe('parseManagedCluster', () => {
  it('should parse a managed cluster to cluster details', () => {
    const mc: ManagedCluster = require(
      `${FIXTURES_DIR}/cluster.open-cluster-management.io/managedclusters/cluster1.json`,
    );

    const result = parseManagedCluster(mc);

    const expected: ClusterDetails = {
      allocatableResources: {
        cpuCores: 1136.5,
        memorySize: '7469511796Ki',
        numberOfPods: 7750,
      },
      availableResources: {
        cpuCores: 1152,
        memorySize: '7505192052Ki',
        numberOfPods: 7750,
      },
      consoleUrl: 'https://console-openshift-console.apps.cluster1.bar.baz',
      kubernetesVersion: 'v1.22.3+fdba464',
      oauthUrl:
        'https://oauth-openshift.apps.cluster1.bar.baz/oauth/token/implicit',
      openshiftId: '5d448ae7-05f1-42cc-aacc-3122a8ad0184',
      openshiftVersion: '4.9.21',
      platform: 'BareMetal',
      region: '',
      status: {
        available: true,
        reason: 'Managed cluster is available',
      },
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse a managed cluster without labels to cluster details', () => {
    const mc: ManagedCluster = require(
      `${FIXTURES_DIR}/cluster.open-cluster-management.io/managedclusters/cluster1.json`,
    );
    mc.status!.allocatable = {};
    mc.status!.capacity = {};
    mc.metadata!.labels = {};

    const result = parseManagedCluster(mc);

    const expected: ClusterDetails = {
      allocatableResources: {
        cpuCores: undefined,
        memorySize: undefined,
        numberOfPods: undefined,
      },
      availableResources: {
        cpuCores: undefined,
        memorySize: undefined,
        numberOfPods: undefined,
      },
      consoleUrl: 'https://console-openshift-console.apps.cluster1.bar.baz',
      kubernetesVersion: 'v1.22.3+fdba464',
      oauthUrl:
        'https://oauth-openshift.apps.cluster1.bar.baz/oauth/token/implicit',
      openshiftId: '5d448ae7-05f1-42cc-aacc-3122a8ad0184',
      openshiftVersion: '4.9.21',
      platform: 'BareMetal',
      region: '',
      status: {
        available: true,
        reason: 'Managed cluster is available',
      },
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse an unavailable managed cluster to cluster details', () => {
    const mc: ManagedCluster = require(
      `${FIXTURES_DIR}/cluster.open-cluster-management.io/managedclusters/cluster1.json`,
    );
    mc.status!.conditions = [
      {
        message: 'Managed cluster is unavailable',
        status: 'False',
        type: 'ManagedClusterConditionAvailable',
      },
    ];

    const result = parseManagedCluster(mc);

    const expected = {
      available: false,
      reason: 'Managed cluster is unavailable',
    };

    expect(result.status).toStrictEqual(expected);
  });
});

describe('parseUpdateInfo', () => {
  it('should correctly parse update information from ClusterInfo', () => {
    const mci: ManagedClusterInfo = require(
      `${FIXTURES_DIR}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`,
    );

    const result = parseUpdateInfo(mci);

    expect(result).toEqual({
      update: {
        available: true,
        version: '4.10.51',
        url: 'https://access.redhat.com/errata/RHSA-2023:0561',
      },
    });
  });

  it('should correctly parse while there are no updates available with no arrays', () => {
    const mciOriginal: ManagedClusterInfo = require(
      `${FIXTURES_DIR}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`,
    );
    const mci = {
      ...mciOriginal,
      status: {
        ...mciOriginal.status!,
        distributionInfo: {
          ...mciOriginal.status!.distributionInfo,
          ocp: {
            ...mciOriginal.status!.distributionInfo.ocp,
            availableUpdates: [],
            versionAvailableUpdates: [],
          },
        },
      },
    };

    const result = parseUpdateInfo(mci);

    expect(result).toEqual({
      update: {
        available: false,
      },
    });
  });

  it('should correctly parse when there is only one update available', () => {
    const mciOriginal: ManagedClusterInfo = require(
      `${FIXTURES_DIR}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`,
    );
    const mci = {
      ...mciOriginal,
      status: {
        ...mciOriginal.status!,
        distributionInfo: {
          ...mciOriginal.status!.distributionInfo,
          ocp: {
            ...mciOriginal.status!.distributionInfo.ocp,
            availableUpdates: [
              mciOriginal.status!.distributionInfo.ocp.availableUpdates!.pop()!,
            ],
            versionAvailableUpdates: [
              mciOriginal.status!.distributionInfo.ocp.versionAvailableUpdates.pop()!,
            ],
          },
        },
      },
    };
    const result = parseUpdateInfo(mci);

    expect(result).toEqual({
      update: {
        available: true,
        version: '4.10.51',
        url: 'https://access.redhat.com/errata/RHSA-2023:0561',
      },
    });
  });
});

describe('parseNodeStatus', () => {
  it('should correctly parse a node list', () => {
    const mciOriginal: ManagedClusterInfo = require(
      `${FIXTURES_DIR}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`,
    );
    const mci = {
      ...mciOriginal,
      status: {
        ...mciOriginal.status!,
        nodeList: [...(mciOriginal.status?.nodeList || [])],
      },
    };

    const result = parseNodeStatus(mci);

    expect(result).toEqual([
      { status: 'True', type: 'Ready' },
      { status: 'True', type: 'Ready' },
      { status: 'True', type: 'Ready' },
    ]);
  });

  it('should return an empty array if nodes are empty', () => {
    const mciOriginal: ManagedClusterInfo = require(
      `${FIXTURES_DIR}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`,
    );
    const mci = {
      ...mciOriginal,
      status: {
        ...mciOriginal.status!,
        nodeList: [],
      },
    };

    const result = parseNodeStatus(mci);

    expect(result).toEqual([]);
  });

  it('should return an empty array if nodes are not present', () => {
    const mciOriginal: ManagedClusterInfo = require(
      `${FIXTURES_DIR}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`,
    );
    const mci = {
      ...mciOriginal,
      status: {
        ...mciOriginal.status!,
        nodeList: undefined,
      },
    };

    const result = parseNodeStatus(mci);

    expect(result).toEqual([]);
  });

  it('should throw an error if there are more conditions in a node', () => {
    const mciOriginal: ManagedClusterInfo = require(
      `${FIXTURES_DIR}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`,
    );
    const mci = {
      ...mciOriginal,
      status: {
        ...mciOriginal.status!,
        nodeList: [
          {
            capacity: {
              cpu: '32',
              memory: '131959088Ki',
              socket: '2',
            },
            conditions: [
              {
                status: 'True',
                type: 'Ready',
              },
              {
                status: 'False',
                type: 'NotReady',
              },
            ],
            labels: {
              'node-role.kubernetes.io/master': '',
              'node-role.kubernetes.io/worker': '',
            },
            name: 'os-ctrl-0.curator.massopen.cloud',
          },
        ],
      },
    };

    const result = () => parseNodeStatus(mci);

    expect(result).toThrow('Found more node conditions then one');
  });
});

describe('translateResourceToOCM', () => {
  it.each([
    ['thisishub', 'local-cluster'],
    ['thisisNOThub', 'thisisNOThub'],
  ])(
    'translates hub cluster name to "local-cluster"',
    (clusterName, expected) => {
      const result = translateResourceToOCM(clusterName, 'thisishub');
      expect(result).toBe(expected);
    },
  );
});

describe('translateOCMToResource', () => {
  it.each([
    ['local-cluster', 'thisishub'],
    ['thisisNOThub', 'thisisNOThub'],
  ])(
    'translates hub cluster name to "local-cluster"',
    (clusterName, expected) => {
      const result = translateOCMToResource(clusterName, 'thisishub');
      expect(result).toBe(expected);
    },
  );
});
