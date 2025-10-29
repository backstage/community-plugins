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
import { CustomResourceMatcher } from '@backstage/plugin-kubernetes-common';
import _ from 'lodash';
import { stringify } from 'yaml';

type Artifact = {
  digest: string;
  lastUpdateTime: string;
  metadata: Map<string, string>;
  path: string;
  revision: string;
  size: number;
  url: string;
};

export enum Kind {
  GitRepository = 0,
  Bucket = 1,
  HelmRepository = 2,
  HelmChart = 3,
  Kustomization = 4,
  HelmRelease = 5,
  Cluster = 6,
  OCIRepository = 7,
  Provider = 8,
  Alert = 9,
  ImageRepository = 10,
  ImageUpdateAutomation = 11,
  ImagePolicy = 12,
  Pod = 13,
  Policy = 14,
}

export interface GroupVersionKind {
  group: string;
  kind: string;
  version: string;
}

export interface HealthStatus {
  status: string;
  message: string;
}

export interface Condition {
  type: string;
  status: string;
  reason?: string;
  message: string;
  timestamp?: string;
}

export interface Interval {
  hours: string;
  minutes: string;
  seconds: string;
}

export interface ObjectRef {
  kind: string;
  name: string;
  namespace: string;
  clusterName: string;
}

export interface GitRepositoryRef {
  branch: string;
  tag: string;
  semver: string;
  commit: string;
}

export interface ResponseObject {
  payload: string;
  clusterName?: string;
  tenant?: string;
  uid?: string;
  inventory?: GroupVersionKind[];
  info?: string;
  health?: HealthStatus;
}

export interface NamespacedObjectReference {
  name: string;
  namespace: string;
}

export interface ImgPolicy {
  type?: string;
  value?: string;
}

export interface Namespace {
  metadata: {
    name: string;
    labels: { [key: string]: string };
    uid: string;
    resourceVersion: string;
    creationTimestamp: string;
  };
}

export type FluxController = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    resourceVersion: string;
    generation: number;
    creationTimestamp: string;
    labels: { [key: string]: string };
    annotations: { [key: string]: string };
  };
  clusterName?: string;
};

export type FluxControllerEnriched = FluxController & { clusterName: string };

export type FluxRelease = {
  name: string;
};

export class FluxObject {
  obj: any;
  clusterName: string;
  tenant: string;
  uid: string;
  info: string;
  children: FluxObject[];
  health?: HealthStatus;
  constructor(response: ResponseObject) {
    try {
      this.obj = JSON.parse(response.payload);
    } catch {
      this.obj = {};
    }
    this.clusterName = response?.clusterName || '';
    this.tenant = response?.tenant || '';
    this.uid = response?.uid || '';
    this.info = response?.info || '';
    this.children = [];
    this.health = response?.health || ({} as ResponseObject['health']);
  }

  get yaml(): string {
    return stringify(this.obj);
  }

  get name(): string {
    return this.obj.metadata?.name || '';
  }

  get namespace(): string {
    return this.obj.metadata?.namespace || '';
  }

  // Return list of key-value pairs for the metadata annotations that follow
  // our spec
  get metadata(): [string, string][] {
    const prefix = 'metadata.weave.works/';
    const annotations = this.obj.metadata?.annotations || {};
    return Object.keys(annotations).flatMap(key => {
      if (!key.startsWith(prefix)) {
        return [];
      }
      return [[key.slice(prefix.length), annotations[key] as string]];
    });
  }

  get labels(): [string, string][] {
    const labels = this.obj.metadata?.labels || {};
    return Object.keys(labels).flatMap(key => {
      return [[key, labels[key] as string]];
    });
  }

  get suspended(): boolean {
    return Boolean(this.obj.spec?.suspend); // if this is missing, it's not suspended
  }

  get type(): Kind | string | undefined {
    return this.obj.kind || this.obj.groupVersionKind?.kind;
  }

  get conditions(): Condition[] {
    return (
      this.obj.status?.conditions?.map((condition: any) => {
        return {
          type: condition.type,
          status: condition.status,
          reason: condition.reason,
          message: condition.message,
          timestamp: condition.lastTransitionTime,
        };
      }) || []
    );
  }

  get interval(): Interval {
    const match =
      /((?<hours>[0-9]+)h)?((?<minutes>[0-9]+)m)?((?<seconds>[0-9]+)s)?/.exec(
        this.obj.spec?.interval,
      );
    const interval = match?.groups || {};
    return {
      hours: interval.hours || '0',
      minutes: interval.minutes || '0',
      seconds: interval.seconds || '0',
    };
  }

  get lastUpdatedAt(): string {
    return this.obj.status?.artifact?.lastUpdateTime || '';
  }

  get images(): string[] | undefined[] {
    const containerPaths = ['spec.template.spec.containers', 'spec.containers'];
    const images = containerPaths.flatMap(path => {
      const containers = _.get(this.obj, path, []);
      // _.map returns an empty list if containers is not iterable
      return _.map(containers, (container: unknown) =>
        _.get(container, 'image'),
      );
    });

    // filter out undefined, null, and other strange objects that might be there
    return images.filter(image => _.isString(image));
  }
}

export class HelmRepository extends FluxObject {
  get repositoryType(): string {
    return this.obj.spec?.type === 'oci' ? 'OCI' : 'Default';
  }

  get url(): string {
    return this.obj.spec?.url || '';
  }

  get provider(): string {
    return this.obj.spec.provider || '';
  }

  get artifact(): Artifact | undefined {
    return this.obj.status.artifact;
  }
}

export class HelmChart extends FluxObject {
  get sourceRef(): ObjectRef | undefined {
    if (!this.obj.spec?.sourceRef) {
      return undefined;
    }
    const sourceRef = {
      ...this.obj.spec.sourceRef,
    };
    if (!sourceRef.namespace) {
      sourceRef.namespace = this.namespace;
    }
    return sourceRef;
  }

  get chart(): string {
    return this.obj.spec?.chart || '';
  }

  get version(): string {
    return this.obj.spec?.version || '';
  }

  get revision(): string {
    return this.obj.status?.artifact?.revision || '';
  }
}

export class Bucket extends FluxObject {
  get endpoint(): string {
    return this.obj.spec?.endpoint || '';
  }
}

export class GitRepository extends FluxObject {
  get url(): string {
    return this.obj.spec?.url || '';
  }

  get reference(): GitRepositoryRef {
    return this.obj.spec?.ref || {};
  }

  get verification(): string | undefined {
    return this.obj.spec.verify?.secretRef.name ?? '';
  }

  get artifact(): Artifact | undefined {
    return this.obj.status.artifact;
  }

  get isVerifiable(): boolean {
    return Boolean(this.obj.spec.verify);
  }
}

export class OCIRepository extends FluxObject {
  get url(): string {
    return this.obj.spec?.url || '';
  }

  get source(): string {
    const metadata = this.obj.status?.artifact?.metadata;
    if (!metadata) {
      return '';
    }
    return metadata['org.opencontainers.image.source'] || '';
  }

  get revision(): string {
    const metadata = this.obj.status?.artifact?.metadata;
    if (!metadata) {
      return '';
    }
    return metadata['org.opencontainers.image.revision'] || '';
  }

  get isVerifiable(): boolean {
    return Boolean(this.obj.spec.verify?.provider !== undefined);
  }

  get verification(): string | undefined {
    return this.obj.spec.verify?.provider;
  }

  get artifact(): Artifact | undefined {
    return this.obj.status.artifact;
  }
}

export class Kustomization extends FluxObject {
  get dependsOn(): NamespacedObjectReference[] {
    return this.obj.spec?.dependsOn || [];
  }

  get sourceRef(): ObjectRef | undefined {
    if (!this.obj.spec?.sourceRef) {
      return undefined;
    }
    const source = {
      ...this.obj.spec.sourceRef,
    };
    if (!source.namespace) {
      source.namespace = this.namespace;
    }
    return source;
  }

  get path(): string {
    return this.obj.spec?.path || '';
  }

  get lastAppliedRevision(): string {
    return this.obj.status?.lastAppliedRevision || '';
  }

  get inventory(): GroupVersionKind[] {
    const entries = this.obj.status?.inventory?.entries || [];
    return Array.from(
      new Set(
        entries.map((entry: any) => {
          // entry is namespace_name_group_kind, but name can contain '_' itself
          const parts = entry.id.split('_');
          const kind = parts[parts.length - 1];
          const group = parts[parts.length - 2];
          return { group, version: entry.v, kind };
        }),
      ),
    );
  }
}

export class HelmRelease extends FluxObject {
  inventory: GroupVersionKind[];

  constructor(response: ResponseObject) {
    super(response);
    try {
      this.inventory = response.inventory || [];
    } catch (error) {
      this.inventory = [];
    }
  }

  get dependsOn(): NamespacedObjectReference[] {
    return this.obj.spec?.dependsOn || [];
  }

  get helmChartName(): string {
    return this.obj.status?.helmChart || '';
  }

  get helmChart(): HelmChart {
    // This isn't a "real" helmchart object - it has much fewer fields,
    // and requires some data mangling to work at all
    let chart = this.obj.spec?.chart;
    chart = { ...chart };
    chart.metadata = {
      name: `${this.namespace}-${this.name}`,
      namespace: chart.spec?.sourceRef?.namespace || this.namespace,
    };
    return new HelmChart({
      payload: JSON.stringify(chart),
      clusterName: this.clusterName,
    });
  }

  get sourceRef(): ObjectRef | undefined {
    return this.helmChart?.sourceRef;
  }

  get lastAppliedRevision(): string {
    return this.obj.status?.lastAppliedRevision || '';
  }

  get lastAttemptedRevision(): string {
    return this.obj.status?.lastAttemptedRevision || '';
  }
}

export class ImageUpdateAutomation extends FluxObject {
  get sourceRef(): ObjectRef | undefined {
    if (!this.obj.spec?.sourceRef) {
      return undefined;
    }
    const source = {
      ...this.obj.spec.sourceRef,
    };
    if (!source.namespace) {
      source.namespace = this.namespace;
    }
    return source;
  }

  get lastAutomationRunTime(): string {
    return this.obj?.status?.lastAutomationRunTime || '';
  }

  get type(): Kind | string | undefined {
    return this.obj.kind || this.obj.groupVersionKind?.kind;
  }
}

export class ImagePolicy extends ImageUpdateAutomation {
  get imagePolicy(): ImgPolicy {
    const { policy } = this.obj?.spec;
    const [type] = Object.keys(policy);
    if (type) {
      const [val] = Object.values(policy[type]);
      return {
        type,
        value: (val as string) || '',
      };
    }
    return {
      type: '',
      value: '',
    };
  }

  get imageRepositoryRef(): string {
    return this.obj?.spec?.imageRepositoryRef?.name || '';
  }

  get latestImage(): string {
    return this.obj?.status?.latestImage || '';
  }
}

export const helmReleaseGVK: CustomResourceMatcher = {
  apiVersion: 'v2beta1',
  group: 'helm.toolkit.fluxcd.io',
  plural: 'helmreleases',
};

export const gitRepositoriesGVK: CustomResourceMatcher = {
  apiVersion: 'v1beta2',
  group: 'source.toolkit.fluxcd.io',
  plural: 'gitrepositories',
};

export const ociRepositoriesGVK: CustomResourceMatcher = {
  apiVersion: 'v1beta2',
  group: 'source.toolkit.fluxcd.io',
  plural: 'ocirepositories',
};

export const helmRepositoryGVK: CustomResourceMatcher = {
  apiVersion: 'v1beta2',
  group: 'source.toolkit.fluxcd.io',
  plural: 'helmrepositories',
};

export const kustomizationGVK: CustomResourceMatcher = {
  apiVersion: 'v1beta2',
  group: 'kustomize.toolkit.fluxcd.io',
  plural: 'kustomizations',
};

export const imagePolicyGVK: CustomResourceMatcher = {
  apiVersion: 'v1beta1',
  group: 'image.toolkit.fluxcd.io',
  plural: 'imagepolicies',
};

export function gvkFromKind(
  kind: String | Kind | undefined,
): CustomResourceMatcher | undefined {
  switch (kind) {
    case 'HelmRelease':
      return helmReleaseGVK;
    case 'HelmRepository':
      return helmRepositoryGVK;
    case 'GitRepository':
      return gitRepositoriesGVK;
    case 'OCIRepository':
      return ociRepositoriesGVK;
    case 'Kustomization':
      return kustomizationGVK;
    case 'ImagePolicy':
      return imagePolicyGVK;
    default:
      break;
  }

  return undefined;
}
