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
  mockK8sResourcesData,
  mockKubernetesResponse,
} from '../__fixtures__/1-deployments';
import { RouteKind } from '../types/route';
import {
  getCheCluster,
  getIngressesDataForResourceServices,
  getIngressURLForResource,
  getIngressWebURL,
  getRoutesDataForResourceServices,
  getRouteWebURL,
  getServicesForResource,
} from './resource-utils';

describe('ResourceUtils:: ingress', () => {
  it('should return ingresses for associated service names', () => {
    const ingressesData = getIngressesDataForResourceServices(
      mockK8sResourcesData.watchResourcesData as any,
      mockKubernetesResponse.deployments[0] as any,
    );
    expect(ingressesData).toEqual([
      {
        ingress: mockKubernetesResponse.ingresses[0],
        url: 'http://hello-world-app.info/',
      },
    ]);
  });

  it('should return no ingresses for associated service name for no match', () => {
    const ingressesData = getIngressesDataForResourceServices(
      mockK8sResourcesData.watchResourcesData as any,
      mockKubernetesResponse.deployments[2] as any,
    );
    expect(ingressesData).toEqual([]);
  });

  it('should return services for associated resource', () => {
    const servicesData = getServicesForResource(
      mockKubernetesResponse.deployments[0] as any,
      mockKubernetesResponse.services as any,
    );
    expect(servicesData).toHaveLength(1);
    expect(servicesData).toEqual([mockKubernetesResponse.services[0]]);
  });

  it('should not return services for associated resource if no services exits', () => {
    const servicesData = getServicesForResource(
      mockKubernetesResponse.deployments[0] as any,
      [],
    );
    expect(servicesData).toHaveLength(0);
    expect(servicesData).toEqual([]);
  });

  it('should not return services for invalid resource', () => {
    const servicesData = getServicesForResource(
      {} as any,
      mockKubernetesResponse.services as any,
    );
    expect(servicesData).toHaveLength(0);
    expect(servicesData).toEqual([]);
  });

  it('should not return services for resource if no associated services found', () => {
    const servicesData = getServicesForResource(
      mockKubernetesResponse.deployments[2] as any,
      mockKubernetesResponse.services as any,
    );
    expect(servicesData).toHaveLength(0);
    expect(servicesData).toEqual([]);
  });

  it('should return URL for provided ingress', () => {
    const mockIngressRule = {
      schema: 'http',
      rules: mockKubernetesResponse.ingresses[0].spec.rules,
    };
    const ingressData = getIngressWebURL(mockIngressRule as any);
    expect(ingressData).toEqual('http://hello-world-app.info/');
  });

  it('should not return URL for provided ingress if host does not exist', () => {
    const mockIngressRule = {
      schema: '',
      rules: [],
    };
    const ingressData = getIngressWebURL(mockIngressRule as any);
    expect(ingressData).toBeUndefined();
  });

  it('should not return URL for provided ingress if host has wildcards', () => {
    const mockIngressRule = {
      schema: 'http',
      rules: [
        {
          host: '*.hello-world-app.info',
          http: mockKubernetesResponse.ingresses[0].spec.rules[0].http,
        },
      ],
    };
    const ingressData = getIngressWebURL(mockIngressRule as any);
    expect(ingressData).toBeUndefined();
  });

  it('should return URL for provided ingress with https', () => {
    const mockIngressRule = {
      schema: 'https',
      rules: mockKubernetesResponse.ingresses[0].spec.rules,
    };

    const ingressData = getIngressWebURL(mockIngressRule as any);
    expect(ingressData).toEqual('https://hello-world-app.info/');
  });

  it('should not return URL for provided ingress if does not exists', () => {
    const ingressData = getIngressWebURL({} as any);
    expect(ingressData).toBeUndefined();
  });

  it('should return URL for provided resource', () => {
    const url = getIngressURLForResource(
      mockK8sResourcesData.watchResourcesData as any,
      mockKubernetesResponse.deployments[0] as any,
    );
    expect(url).toEqual('http://hello-world-app.info/');
  });

  it('should not return URL for provided resource', () => {
    const url = getIngressURLForResource(
      mockK8sResourcesData.watchResourcesData as any,
      mockKubernetesResponse.deployments[2] as any,
    );
    expect(url).toBeUndefined();
  });
});

describe('ResourceUtils:: Routes', () => {
  it('should return routes for associated service names', () => {
    const routesData = getRoutesDataForResourceServices(
      mockK8sResourcesData.watchResourcesData as any,
      mockKubernetesResponse.deployments[0] as any,
    );
    expect(routesData).toEqual([
      {
        route: mockKubernetesResponse.routes[0],
        url: 'https://nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com',
      },
    ]);
  });

  it('should return no routes for associated service name for no match', () => {
    const routesData = getRoutesDataForResourceServices(
      mockK8sResourcesData.watchResourcesData as any,
      mockKubernetesResponse.deployments[2] as any,
    );
    expect(routesData).toEqual([]);
  });

  it('should return URL for provided route resource', () => {
    const URL = getRouteWebURL(mockKubernetesResponse.routes[0] as RouteKind);
    expect(URL).toEqual(
      'https://nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com',
    );
  });
});

describe('ResourceUtils:: CheCluster', () => {
  it('should return cheCluster from openshift-devspaces ns', () => {
    const cheCluster = getCheCluster({
      checlusters: { data: mockKubernetesResponse.checlusters },
    } as any);
    expect(cheCluster).toEqual(mockKubernetesResponse.checlusters[0]);
  });
});
