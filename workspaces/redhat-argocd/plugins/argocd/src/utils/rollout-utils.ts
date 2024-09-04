import { V1OwnerReference } from '@kubernetes/client-node';
import { now } from 'moment';

import { AnalysisRun } from '../types/analysisRuns';
import {
  ArgoResources,
  ReplicaSet,
  ValidArgoResource,
} from '../types/resources';
import { RolloutUI } from '../types/revision';
import {
  APP_KUBERNETES_INSTANCE_LABEL,
  Rollout,
  ROLLOUT_REVISION_ANNOTATION,
} from '../types/rollouts';

export const getRevision = (rplset: ReplicaSet) =>
  rplset.metadata?.annotations?.[ROLLOUT_REVISION_ANNOTATION] ?? '';

export const filterByOwnerName = <T extends ValidArgoResource>(
  resource: T,
  ownerName: string | undefined,
): boolean =>
  resource.metadata?.ownerReferences?.some(ref => ref.name === ownerName) ||
  false;

export const filterResourcesByOwnerName = <T extends ValidArgoResource>(
  resources: T[],
  ownerName: string | undefined,
): T[] => resources.filter(resource => filterByOwnerName(resource, ownerName));

export const filterResourcesByOwnerRef = <T extends ValidArgoResource>(
  resources: T[],
  ownerRef: V1OwnerReference,
  extraConditions: (resource: T) => boolean = () => true,
): T[] =>
  resources.filter(
    resource =>
      extraConditions(resource) && filterByOwnerName(resource, ownerRef?.name),
  );

export const filterResourcesByApplicationName = <T extends ValidArgoResource>(
  resources: T[],
  appName: string | undefined,
): T[] => {
  return !appName
    ? []
    : resources?.filter(
        r =>
          Boolean(r?.metadata?.labels?.[APP_KUBERNETES_INSTANCE_LABEL]) &&
          r.metadata?.labels?.[APP_KUBERNETES_INSTANCE_LABEL] === appName,
      );
};

export const sortByDate = <T extends ValidArgoResource>(resources: T[]): T[] =>
  (resources ?? []).sort(
    (a: T, b: T) =>
      new Date(a.metadata?.creationTimestamp || now()).getTime() -
      new Date(b.metadata?.creationTimestamp || now()).getTime(),
  );

export const getRolloutUIResources = (
  argoResources: ArgoResources,
  kubernetesId: string | undefined,
): RolloutUI[] => {
  const { rollouts: _rollouts, analysisruns, replicasets } = argoResources;
  const getRevisions = (rollout: Rollout): ReplicaSet[] => {
    const rolloutName = rollout?.metadata.name;
    return filterResourcesByOwnerName(replicasets, rolloutName).sort(
      (a, b) => parseInt(getRevision(b), 10) - parseInt(getRevision(a), 10),
    );
  };

  const getAnalysisRuns = (rpl: ReplicaSet): AnalysisRun[] => {
    const [ownerReference] = rpl.metadata?.ownerReferences || [];

    if (!ownerReference) return [];
    const rolloutRevision =
      rpl.metadata?.annotations?.[ROLLOUT_REVISION_ANNOTATION];

    return sortByDate(
      filterResourcesByOwnerRef(
        analysisruns,
        ownerReference,
        (ar: AnalysisRun) =>
          ar.metadata?.annotations?.[ROLLOUT_REVISION_ANNOTATION] ===
          rolloutRevision,
      ),
    );
  };

  const rollouts =
    (filterResourcesByApplicationName(_rollouts, kubernetesId).map(rollout => ({
      ...rollout,
      revisions: getRevisions(rollout)?.map(revision => ({
        ...revision,
        rollout,
        analysisRuns: getAnalysisRuns(revision),
      })),
    })) as RolloutUI[]) ?? [];

  return rollouts;
};
