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
import { Link } from '@backstage/core-components';
import {
  RouteFunc,
  SubRouteRef,
  useRouteRef,
} from '@backstage/core-plugin-api';
import * as React from 'react';
import { isMultiCluster } from '../config';
import {
  appDetailRouteRef,
  appsRouteRef,
  istioConfigDetailRouteRef,
  istioConfigRouteRef,
  rootRouteRef,
  servicesDetailRouteRef,
  servicesRouteRef,
  workloadsDetailRouteRef,
  workloadsRouteRef,
} from '../routes';

type routeRefParams = undefined | { [key: string]: string };
export const backstageRoutesObject: {
  [key: string]: { id: string; ref: SubRouteRef };
} = {
  workloads: { id: 'workload', ref: workloadsDetailRouteRef },
  services: { id: 'service', ref: servicesDetailRouteRef },
  applications: { id: 'app', ref: appDetailRouteRef },
  istio: { id: 'object', ref: istioConfigDetailRouteRef },
};

export const backstageRoutesSection: { [key: string]: SubRouteRef } = {
  istio: istioConfigRouteRef,
  workloads: workloadsRouteRef,
  services: servicesRouteRef,
  applications: appsRouteRef,
};

const addQuery = (endpoint: string, cluster?: string, query?: string) => {
  let queryParam = query;
  if (cluster && isMultiCluster) {
    queryParam += queryParam ? '&' : '';
    queryParam += `clusterName=${cluster}`;
  }
  return queryParam ? `${endpoint}?${queryParam}` : endpoint;
};

interface BackstageLinkProps {
  cluster?: string;
  key?: string;
  className?: string;
  entity?: boolean;
  root?: boolean;
  name?: string;
  type: string;
  namespace?: string;
  objectType?: string;
  query?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const getRef = (type: string, entity?: boolean, root?: boolean) => {
  if (entity && root) {
    return rootRouteRef;
  }

  if (!entity && root) {
    return backstageRoutesSection[type];
  }

  return backstageRoutesObject[type].ref;
};

export const BackstageObjectLink = (props: BackstageLinkProps) => {
  const { name, type, objectType, namespace, query, cluster } = props;
  const link: RouteFunc<routeRefParams> = useRouteRef(
    getRef(type, props.entity, props.root),
  );
  let to = '';
  if (!props.root) {
    const items: { [key: string]: string } = { namespace: namespace || '' };

    if (type && name) {
      items[backstageRoutesObject[type].id] = name;
    }
    if (objectType) {
      items.objectType = objectType;
    }
    to = link(items);
  } else {
    to = link();
  }
  const href = addQuery(to, cluster, query);
  return (
    <Link
      to={href}
      data-test={`${
        type ? backstageRoutesObject[type].id : ''
      }-${namespace}-${name}`}
      {...props}
    >
      {props.children || `${namespace}/${name}`}
    </Link>
  );
};
