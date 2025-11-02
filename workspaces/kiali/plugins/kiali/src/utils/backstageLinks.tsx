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
import { GroupVersionKind } from '@backstage-community/plugin-kiali-common/types';
import { Link } from '@backstage/core-components';
import { SubRouteRef } from '@backstage/core-plugin-api';
import { Drawer, IconButton } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { default as React } from 'react';
import { AppDetailsDrawer } from '../components/Drawers/AppDetailsDrawer';
import { IstioConfigDetailsDrawer } from '../components/Drawers/IstioConfigDetailsDrawer';
import { ServiceDetailsDrawer } from '../components/Drawers/ServiceDetailsDrawer';
import { WorkloadDetailsDrawer } from '../components/Drawers/WorkloadDetailsDrawer';
import { isMultiCluster } from '../config';
import {
  appDetailRouteRef,
  appsRouteRef,
  istioConfigDetailRouteRef,
  istioConfigRouteRef,
  servicesDetailRouteRef,
  servicesRouteRef,
  workloadsDetailRouteRef,
  workloadsRouteRef,
} from '../routes';

// type routeRefParams = undefined | { [key: string]: string };
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
  objectGVK?: GroupVersionKind;
  query?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  useDrawer?: boolean; // New prop to control drawer behavior
}

/* const getRef = (type: string, entity?: boolean, root?: boolean) => {
  if (entity && root) {
    return rootRouteRef;
  }

  if (!entity && root) {
    return backstageRoutesSection[type];
  }

  return backstageRoutesObject[type].ref;
};*/

// Component for drawer content
const DrawerContent = ({
  toggleDrawer,
  type,
  name,
  namespace,
  objectGVK,
}: {
  toggleDrawer: (isOpen: boolean) => void;
  type: string;
  name: string;
  namespace: string;
  objectGVK?: GroupVersionKind;
}) => {
  return (
    <div style={{ padding: '10px', minWidth: '400px' }} data-test="drawer">
      <div style={{ paddingBottom: '30px' }}>
        <IconButton
          key="dismiss"
          id="close_drawer"
          title="Close the drawer"
          onClick={() => toggleDrawer(false)}
          color="inherit"
          style={{ right: '0', position: 'absolute', top: '5px' }}
        >
          <Close />
        </IconButton>
      </div>
      <div />
      <div>
        {type === 'workloads' && (
          <WorkloadDetailsDrawer namespace={namespace} workload={name} />
        )}
        {type === 'services' && (
          <ServiceDetailsDrawer namespace={namespace} service={name} />
        )}
        {type === 'applications' && (
          <AppDetailsDrawer namespace={namespace} app={name} />
        )}
        {type === 'istio' && (
          <IstioConfigDetailsDrawer
            namespace={namespace}
            istioType={
              objectGVK?.Kind ||
              (name.includes('gateway') ? 'Gateway' : 'VirtualService')
            }
            name={name}
          />
        )}
      </div>
    </div>
  );
};

export const BackstageObjectLink = (props: BackstageLinkProps) => {
  const { name, type, query, cluster, namespace, objectGVK, useDrawer } = props;
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // If useDrawer is true and we have the required props, show drawer behavior
  if (useDrawer && name && namespace && type && !props.root) {
    return (
      <>
        <Link
          to="#"
          component="button"
          onClick={e => {
            e.preventDefault();
            setIsDrawerOpen(true);
          }}
          data-test={`${
            type ? backstageRoutesObject[type].id : ''
          }-namespace-${name}`}
          style={{
            textDecoration: 'underline',
            color: 'inherit',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            font: 'inherit',
          }}
        >
          {props.children || name}
        </Link>
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <DrawerContent
            toggleDrawer={setIsDrawerOpen}
            type={type}
            name={name}
            namespace={namespace}
            objectGVK={objectGVK}
          />
        </Drawer>
      </>
    );
  }

  // Original link behavior
  let to = '';

  if (!props.root) {
    if (type && name && namespace) {
      // Generate detail page URLs
      switch (type) {
        case 'workloads':
          to = `/workloads/${namespace}/${name}`;
          break;
        case 'services':
          to = `/services/${namespace}/${name}`;
          break;
        case 'applications':
          to = `/applications/${namespace}/${name}`;
          break;
        case 'istio':
          if (objectGVK) {
            to = `/istio/${namespace}/${objectGVK.Kind}/${name}`;
          }
          break;
        default:
          to = '';
      }
    }
  } else {
    // Generate section URLs
    switch (type) {
      case 'workloads':
        to = '/workloads';
        break;
      case 'services':
        to = '/services';
        break;
      case 'applications':
        to = '/applications';
        break;
      case 'istio':
        to = '/istio';
        break;
      default:
        to = '';
    }
  }

  const href = addQuery(to, cluster, query);
  return (
    <Link
      to={href}
      data-test={`${
        type ? backstageRoutesObject[type].id : ''
      }-namespace-${name}`}
      {...props}
    >
      {props.children || `namespace/${name}`}
    </Link>
  );
};
