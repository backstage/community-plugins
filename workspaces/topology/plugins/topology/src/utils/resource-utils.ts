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
import {
  V1CronJob,
  V1DaemonSet,
  V1Deployment,
  V1Ingress,
  V1Job,
  V1Pod,
  V1PodTemplate,
  V1Service,
  V1StatefulSet,
} from '@kubernetes/client-node';

import { IngressesData } from '../types/ingresses';
import { JobsData } from '../types/jobs';
import { RouteIngress, RouteKind, RoutesData } from '../types/route';
import { OverviewItem } from '../types/topology-types';
import {
  IngressRule,
  K8sResponseData,
  K8sWorkloadResource,
} from '../types/types';
import { VM_TYPE, VMITemplate, VMSpec } from '../types/vm';
import { LabelSelector } from './label-selector';
import {
  getJobsForCronJob,
  getPodsDataForResource,
} from './pod-resource-utils';
import { WORKLOAD_TYPES } from './topology-utils';

export const byCreationTime = (left: any, right: any): number => {
  const leftCreationTime = new Date(
    left?.metadata?.creationTimestamp || Date.now(),
  );
  const rightCreationTime = new Date(
    right?.metadata?.creationTimestamp || Date.now(),
  );
  return rightCreationTime.getTime() - leftCreationTime.getTime();
};

const validPod = (pod: V1Pod) => {
  const owners = pod?.metadata?.ownerReferences;
  const phase = pod?.status?.phase;
  return (
    (!owners || Object.keys(owners).length === 0) &&
    phase !== 'Succeeded' &&
    phase !== 'Failed'
  );
};

const isStandaloneJob = (job: K8sWorkloadResource) =>
  !job.metadata?.ownerReferences?.find(owner => owner.kind === 'CronJob');

export const createOverviewItemForType = (
  type: string,
  resource: K8sWorkloadResource,
): OverviewItem | undefined => {
  if (![...WORKLOAD_TYPES, VM_TYPE].includes(type)) {
    return undefined;
  }
  switch (type) {
    case 'jobs':
      return isStandaloneJob(resource)
        ? {
            obj: resource,
          }
        : undefined;
    case 'pods':
      return validPod(resource as V1Pod)
        ? {
            obj: resource,
          }
        : undefined;
    default:
      return {
        obj: resource,
      };
  }
};

const getPodTemplate = (
  resource: K8sWorkloadResource,
): V1PodTemplate | VMITemplate | undefined => {
  switch (resource.kind) {
    case 'Pod':
      return resource as V1PodTemplate;
    case 'Deployment':
      return (resource as V1Deployment).spec?.template;
    case 'StatefulSet':
      return (resource as V1StatefulSet).spec?.template;
    case 'Job':
      return (resource as V1Job).spec?.template;
    case 'CronJob':
      return (resource as V1CronJob).spec?.jobTemplate?.spec?.template;
    case 'DaemonSet':
      return (resource as V1DaemonSet).spec?.template;
    case 'VirtualMachine':
      return (resource?.spec as VMSpec)?.template;
    default:
      return undefined;
  }
};

export const getServicesForResource = (
  resource: K8sWorkloadResource,
  services: V1Service[],
): V1Service[] => {
  if (!resource || !services) {
    return [];
  }
  const template = getPodTemplate(resource);
  return services.filter((service: V1Service) => {
    if (resource.metadata?.namespace !== service.metadata?.namespace)
      return false;
    const specSelector = service.spec?.selector || {};
    const selector = new LabelSelector(specSelector);
    return selector.matches(template);
  });
};

export const getIngressWebURL = (
  ingressRule: IngressRule,
): string | undefined => {
  const schema = ingressRule.schema;
  const { host, http } = ingressRule.rules?.[0] || {};
  if (!host || host.includes('*')) {
    // return if host doesn't exist or is a wildcard
    return undefined;
  }
  let url = `${schema}://${host}`;
  if (http?.paths && http.paths.length > 0) {
    url += http.paths[0].path;
  }
  return url;
};

export const getIngressesURL = (
  ingressesData: any = [],
): string | undefined => {
  const [ingressData] = ingressesData;
  return ingressData?.url;
};

const validUrl = (url?: string | null) =>
  url?.startsWith('http://') || url?.startsWith('https://');

export const getIngressesDataForResourceServices = (
  resources: K8sResponseData,
  resource: K8sWorkloadResource,
): IngressesData => {
  const services = getServicesForResource(
    resource,
    resources.services?.data as V1Service[],
  );
  const servicesNames = services.map((s: V1Service) => s.metadata?.name ?? '');

  const ingressesData = (
    (resources.ingresses?.data as V1Ingress[]) ?? []
  ).reduce((acc: IngressesData, ingress: V1Ingress) => {
    const rules = ingress.spec?.rules?.filter(rule => {
      return rule.http?.paths?.some(path => {
        return (
          path.backend?.service?.name &&
          servicesNames.includes(path.backend.service.name)
        );
      });
    });
    if (rules?.length) {
      const ingressURL = getIngressWebURL({
        schema: ingress.spec?.tls ? 'https' : 'http',
        rules,
      });
      acc.push({
        ingress,
        url: validUrl(ingressURL) ? ingressURL : undefined,
      });
    }
    return acc;
  }, []);

  return ingressesData;
};

export const getIngressURLForResource = (
  resources: K8sResponseData,
  resource: K8sWorkloadResource,
): string | undefined => {
  if (!resources.ingresses?.data) {
    return undefined;
  }
  const ingressesData = getIngressesDataForResourceServices(
    resources,
    resource,
  );

  return getIngressesURL(ingressesData);
};

export const getJobsDataForResource = (
  resources: K8sResponseData,
  resource: K8sWorkloadResource,
): JobsData => {
  if (!resources.jobs?.data?.length) {
    return [];
  }

  const resourceJobs = getJobsForCronJob(
    resource.metadata?.uid ?? '',
    resources,
  ) as V1Job[];

  return resourceJobs.map((job: V1Job) => ({
    job,
    podsData: getPodsDataForResource(job, resources),
  }));
};

const getRouteHost = (
  route: RouteKind,
  onlyAdmitted: boolean,
): string | undefined => {
  let oldestAdmittedIngress: any;
  let oldestTransitionTime: string;

  route.status?.ingress.forEach((ingress: RouteIngress) => {
    const admittedCondition = ingress.conditions?.find(
      condition => condition.type === 'Admitted' && condition.status === 'True',
    );
    if (
      admittedCondition?.lastTransitionTime &&
      (!oldestTransitionTime ||
        oldestTransitionTime > admittedCondition.lastTransitionTime)
    ) {
      oldestAdmittedIngress = ingress;
      oldestTransitionTime = admittedCondition.lastTransitionTime;
    }
  });

  if (oldestAdmittedIngress) {
    return oldestAdmittedIngress.host;
  }

  return onlyAdmitted ? undefined : route.spec?.host;
};

export const getRouteWebURL = (route: RouteKind): string => {
  const scheme = route?.spec?.tls?.termination ? 'https' : 'http';
  let url = `${scheme}://${getRouteHost(route, false)}`;
  if (route.spec?.path) {
    url += route.spec.path;
  }
  return url;
};

export const getRoutesDataForResourceServices = (
  resources: K8sResponseData,
  resource: K8sWorkloadResource,
): RoutesData => {
  const services = getServicesForResource(
    resource,
    resources.services?.data as V1Service[],
  );
  const servicesNames = services.map((s: V1Service) => s.metadata?.name ?? '');
  const routes = (resources.routes?.data as RouteKind[]) ?? [];
  if (!servicesNames?.length || !routes?.length) {
    return [];
  }

  const routesData: RoutesData = routes.reduce(
    (acc: RoutesData, route: RouteKind) => {
      if (
        route.spec?.to?.name &&
        servicesNames.includes(route.spec.to.name) &&
        resource.metadata?.namespace === route.metadata?.namespace
      ) {
        acc.push({
          route,
          url: getRouteWebURL(route),
        });
      }
      return acc;
    },
    [] as RoutesData,
  );

  return routesData;
};

export const getRoutesURLforResource = (
  resources: K8sResponseData,
  resource: K8sWorkloadResource,
): string | undefined => {
  if (!resources.routes?.data) {
    return undefined;
  }

  const routesData = getRoutesDataForResourceServices(resources, resource);

  return getIngressesURL(routesData);
};

export const getUrlForResource = (
  resources: K8sResponseData,
  resource: K8sWorkloadResource,
): string | undefined => {
  return (
    getRoutesURLforResource(resources, resource) ||
    getIngressURLForResource(resources, resource)
  );
};

export const getCheCluster = (resources: K8sResponseData) =>
  resources.checlusters?.data?.find(
    cc => cc.metadata?.namespace === 'openshift-devspaces',
  );
