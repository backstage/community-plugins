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
import { Entity } from '@backstage/catalog-model';
import pluralize from 'pluralize';

import {
  Application,
  OperationPhases,
  OperationState,
  Resource,
  RevisionInfo,
} from '@backstage-community/plugin-redhat-argocd-common';
import { ArgoResources } from '../types/resources';

export const enum ArgoCdLabels {
  appSelector = 'argocd/app-selector',
  instanceName = 'argocd/instance-name',
  projectName = 'argocd/project-name',
  appName = 'argocd/app-name',
  appNamespace = 'argocd/app-namespace',
}

export const getAppSelector = (entity: Entity): string => {
  return entity?.metadata?.annotations?.[ArgoCdLabels.appSelector] ?? '';
};
export const getAppName = (entity: Entity): string => {
  return entity?.metadata?.annotations?.[ArgoCdLabels.appName] ?? '';
};
export const getAppNamespace = (entity: Entity): string => {
  return entity?.metadata?.annotations?.[ArgoCdLabels.appNamespace] ?? '';
};

export const getInstanceName = (entity: Entity): string => {
  return entity?.metadata?.annotations?.[ArgoCdLabels.instanceName] ?? '';
};

export const getProjectName = (entity: Entity): string | undefined => {
  return entity?.metadata?.annotations?.[ArgoCdLabels.projectName];
};

export const getArgoCdAppConfig = ({ entity }: { entity: Entity }) => {
  const appName = getAppName(entity);
  const appSelector = encodeURIComponent(getAppSelector(entity));
  const appNamespace = getAppNamespace(entity);
  const projectName = getProjectName(entity);
  const url = '/argocd/api';

  if (!(appName || appSelector)) {
    throw new Error('Argo CD annotation is missing in the catalog');
  } else if (appName && appSelector) {
    throw new Error(
      `Cannot provide both ${ArgoCdLabels.appName} and ${ArgoCdLabels.appSelector} annotations`,
    );
  }
  return { url, appName, appSelector, appNamespace, projectName };
};

type ProviderType = 'github' | 'gitlab' | 'unknown';

export enum Providers {
  github = 'github',
  gitlab = 'gitlab',
  unknown = 'unknown',
}

export enum KnownProviders {
  gitlab = 'gitlab.com',
  github = 'github.com',
}

export const isAppHelmChartType = (application: Application) =>
  !!application?.spec?.source?.chart;

export const getGitProvider = (annotations: {
  [key: string]: string;
}): ProviderType => {
  const entityKeys = Object.keys(annotations ?? {});
  if (entityKeys.length === 0) {
    return Providers.unknown;
  }
  let provider: ProviderType = Providers.unknown;
  entityKeys.forEach(key => {
    if (provider !== Providers.unknown) {
      return;
    }
    if (
      key.startsWith(KnownProviders.gitlab) ||
      annotations[key].includes(KnownProviders.gitlab)
    ) {
      provider = Providers.gitlab;
    } else if (
      key.startsWith(KnownProviders.github) ||
      annotations[key].includes(KnownProviders.github)
    ) {
      provider = Providers.github;
    } else {
      provider = Providers.unknown;
    }
  });

  return provider;
};

export const getCommitUrl = (
  url: string,
  revisionId: string,
  annotations: { [key: string]: string },
) => {
  const sanitizedUrl = url.replace('.git', '');
  const providerCommitPrefix: { [key in ProviderType]: string } = {
    gitlab: '/-/commit/',
    github: '/commit/',
    unknown: '',
  };

  let provider: ProviderType = Providers.unknown;

  if (provider === Providers.unknown) {
    provider = getGitProvider(annotations);
  }

  return provider === Providers.unknown
    ? sanitizedUrl
    : `${sanitizedUrl}${providerCommitPrefix[provider]}${revisionId}`;
};

export const getAppOperationState = (app: Application): OperationState => {
  if (app.operation) {
    return {
      phase: OperationPhases.Running,
      message: app?.status?.operationState?.message || 'waiting to start',
      startedAt: new Date().toISOString(),
      operation: {
        sync: {},
      },
    } as OperationState;
  } else if (app.metadata.deletionTimestamp) {
    return {
      phase: OperationPhases.Running,
      message: '',
      startedAt: app.metadata.deletionTimestamp,
      operation: {
        sync: {},
      },
    } as any;
  }
  return app.status.operationState;
};

const isSubset = (subset: any[], array: any[]): boolean => {
  if (!array || !array.length) {
    return false;
  }

  const targetSet = new Set(array);
  return subset.every(element => targetSet.has(element));
};

export const getUniqueRevisions = (apps: Application[]): string[] => {
  if (!apps) return [];

  return apps.reduce((acc: string[], app) => {
    const history = app?.status?.history ?? [];
    const revisions: string[] = [];

    if (history.length > 0) {
      history.forEach(h => {
        // Multi-source application
        if (h?.revisions && !isSubset(h?.revisions, revisions)) {
          revisions.push(...h?.revisions);
        }

        // Single source application
        if (
          h.revision &&
          !revisions.includes(h.revision as string) &&
          !isAppHelmChartType(app)
        ) {
          revisions.push(h?.revision);
        }
      });
    }

    // Add unique, defined revisions to accumulator
    return [...new Set([...acc, ...revisions])].filter(Boolean);
  }, []);
};

export const getResourceCreateTimestamp = (
  argoResources: ArgoResources,
  targetResource: Resource,
) => {
  const resources =
    argoResources[pluralize(targetResource?.kind).toLocaleLowerCase('en-US')];

  if (!resources || !Array.isArray(resources)) {
    return null;
  }

  for (const resource of resources) {
    const { name, namespace, creationTimestamp } = resource.metadata;

    if (
      name === targetResource.name &&
      namespace === targetResource.namespace &&
      creationTimestamp
    ) {
      return creationTimestamp;
    }
  }

  return null;
};

export const sortValues = (
  aValue: any,
  bValue: any,
  order: 'asc' | 'desc',
): number => {
  if (aValue === undefined || bValue === undefined) return 0;

  if (!isNaN(Date.parse(aValue)) && !isNaN(Date.parse(bValue))) {
    const aDate = new Date(aValue).getTime();
    const bDate = new Date(bValue).getTime();
    return order === 'asc' ? aDate - bDate : bDate - aDate;
  }

  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return order === 'asc' ? aValue - bValue : bValue - aValue;
  }

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return order === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  }

  return 0;
};

/**
 * Removes duplicate commits based on their author, message and date.
 */
export const removeDuplicateRevisions = (
  revisions: RevisionInfo[],
): RevisionInfo[] => {
  const uniqueMap = new Map<string, RevisionInfo>();

  revisions.forEach(revision => {
    const key = `${revision.author}-${
      revision.message
    }-${revision.date.toString()}`;
    uniqueMap.set(key, revision);
  });

  return Array.from(uniqueMap.values());
};
