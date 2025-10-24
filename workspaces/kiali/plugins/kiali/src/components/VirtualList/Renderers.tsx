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
import { Health } from '@backstage-community/plugin-kiali-common/func';
import {
  ComponentStatus,
  DRAWER,
  ENTITY,
  IstioConfigItem,
  NamespaceInfo,
  ServiceListItem,
  ValidationStatus,
  WorkloadListItem,
} from '@backstage-community/plugin-kiali-common/types';
import { Link } from '@backstage/core-components';
import {
  Button,
  Chip,
  Drawer,
  IconButton,
  TableCell,
  Tooltip,
} from '@material-ui/core';
// eslint-disable-next-line no-restricted-imports
import { Close } from '@material-ui/icons';
import { default as React } from 'react';
import { KialiIcon, serverConfig } from '../../config';
import { isWaypoint } from '../../helpers/LabelFilterHelper';
import { infoStyle } from '../../pages/Overview/OverviewCard/CanaryUpgradeProgress';
import { ControlPlaneBadge } from '../../pages/Overview/OverviewCard/ControlPlaneBadge';
import { OverviewCardSparklineCharts } from '../../pages/Overview/OverviewCard/OverviewCardSparklineCharts';
import { BackstageObjectLink } from '../../utils/backstageLinks';
import {
  getIstioObjectGVK,
  getReconciliationCondition,
} from '../../utils/IstioConfigUtils';
import { AppDetailsDrawer } from '../Drawers/AppDetailsDrawer';
import { IstioConfigDetailsDrawer } from '../Drawers/IstioConfigDetailsDrawer';
import { ServiceDetailsDrawer } from '../Drawers/ServiceDetailsDrawer';
import { WorkloadDetailsDrawer } from '../Drawers/WorkloadDetailsDrawer';
import { StatefulFilters } from '../Filters/StatefulFilters';
import { HealthIndicator } from '../Health/HealthIndicator';
import { NamespaceMTLSStatus } from '../MTls/NamespaceMTLSStatus';
import { PFBadge, PFBadges, PFBadgeType } from '../Pf/PfBadges';
import { ValidationObjectSummary } from '../Validations/ValidationObjectSummary';
import { ValidationServiceSummary } from '../Validations/ValidationServiceSummary';
import { ValidationSummary } from '../Validations/ValidationSummary';
import { Renderer, Resource, SortResource, TResource } from './Config';

const topPosition = 'top';

// Cells
export const actionRenderer = (
  key: string,
  action: React.ReactNode,
): React.ReactNode => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Action_${key}`}
      style={{ verticalAlign: 'middle' }}
    >
      {action}
    </TableCell>
  );
};

const DrawerDiv = ({
  name,
  namespace,
  config,
  resource,
}: {
  name: string;
  namespace: string;
  config: string;
  resource?: TResource;
}) => {
  const [isOpen, toggleDrawer] = React.useState(false);
  const DrawerContent = ({
    toggleDrawer2,
  }: {
    toggleDrawer2: (isOpen: boolean) => void;
  }) => {
    return (
      <div style={{ padding: '10px', minWidth: '400px' }} data-test="drawer">
        <div style={{ paddingBottom: '30px' }}>
          <IconButton
            key="dismiss"
            id="close_drawer"
            title="Close the drawer"
            onClick={() => toggleDrawer2(false)}
            color="inherit"
            style={{ right: '0', position: 'absolute', top: '5px' }}
          >
            <Close />
          </IconButton>
        </div>
        <div />
        <div>
          {config === 'workloads' && (
            <WorkloadDetailsDrawer namespace={namespace} workload={name} />
          )}
          {config === 'services' && (
            <ServiceDetailsDrawer namespace={namespace} service={name} />
          )}
          {config === 'applications' && (
            <AppDetailsDrawer namespace={namespace} app={name} />
          )}
          {config === 'istio' && resource && (
            <IstioConfigDetailsDrawer
              namespace={namespace}
              istioType={(resource as IstioConfigItem).kind}
              name={name}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        id={`drawer_${namespace}_${name}`}
        onClick={() => toggleDrawer(true)}
      >
        {name}
      </Button>
      <Drawer anchor="right" open={isOpen} onClose={() => toggleDrawer(false)}>
        <DrawerContent toggleDrawer2={toggleDrawer} />
      </Drawer>
    </>
  );
};

export const item: Renderer<TResource> = (
  resource: TResource,
  config: Resource,
  badge: PFBadgeType,
  _?: Health,
  __?: React.RefObject<StatefulFilters>,
  view?: string,
  linkColor?: string,
): React.ReactElement => {
  const key = `link_definition_${config.name}_${resource.namespace}_${resource.name}`;
  let serviceBadge = badge;

  if ('serviceRegistry' in resource && resource.serviceRegistry) {
    switch (resource.serviceRegistry) {
      case 'External':
        serviceBadge = PFBadges.ExternalService;
        break;
      case 'Federation':
        serviceBadge = PFBadges.FederatedService;
        break;
      default: // TODO
        serviceBadge = PFBadges.ExternalService;
        break;
    }
  }

  if (view === DRAWER) {
    return (
      <TableCell
        key={`VirtuaItem_Item_${resource.namespace}_${resource.name}`}
        style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}
      >
        <DrawerDiv
          name={resource.name}
          namespace={resource.namespace}
          config={config.name}
          resource={resource}
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      key={`VirtuaItem_Item_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}
    >
      {view !== ENTITY && view !== DRAWER && (
        <PFBadge badge={serviceBadge} position={topPosition} />
      )}
      <BackstageObjectLink
        type={config.name}
        entity={view === ENTITY}
        name={resource.name}
        namespace={resource.namespace}
        cluster={resource.cluster}
        objectGVK={
          config.name === 'istio'
            ? getIstioObjectGVK('', (resource as IstioConfigItem).kind)
            : undefined
        }
        key={key}
        className={linkColor}
        useDrawer
      >
        {resource.name}
      </BackstageObjectLink>
    </TableCell>
  );
};

export const cluster: Renderer<TResource> = (resource: TResource) => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Cluster_${resource.cluster}`}
      style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}
    >
      <PFBadge badge={PFBadges.Cluster} position={topPosition} />
      {resource.cluster}
    </TableCell>
  );
};

export const namespace: Renderer<TResource> = (
  resource: TResource,
  _: Resource,
  __: PFBadgeType,
  ___?: Health,
  ____?: React.RefObject<StatefulFilters>,
  view?: string,
) => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Namespace_${resource.namespace}_${item.name}`}
      style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}
    >
      {view !== ENTITY && view !== DRAWER && (
        <PFBadge badge={PFBadges.Namespace} position={topPosition} />
      )}
      {resource.namespace}
    </TableCell>
  );
};

export const labels: Renderer<SortResource | NamespaceInfo> = (
  resource: SortResource | NamespaceInfo,
  _: Resource,
  __: PFBadgeType,
  ___?: Health,
  ____?: React.RefObject<StatefulFilters>,
  view?: string,
) => {
  // @ts-ignore
  let path = window.location.pathname;
  path = path.substring(path.lastIndexOf('/console') + '/console'.length + 1);

  const labelsView = resource.labels ? (
    Object.entries(resource.labels).map(([key, value], _i) => {
      return <Chip key={key} label={`${key}=${value}`} />;
    })
  ) : (
    <></>
  );

  const labelsWrap = <div>{labelsView}</div>;

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Labels_${
        'namespace' in resource && `${resource.namespace}_`
      }${resource.name}`}
      style={{ verticalAlign: 'middle', paddingBottom: '0.25rem' }}
    >
      {(view === ENTITY || view === DRAWER) && resource.labels && (
        <Tooltip title={labelsWrap}>
          <Chip label={Object.entries(resource.labels).length.toString()} />
        </Tooltip>
      )}
      {view !== ENTITY && view !== DRAWER && labelsView}
    </TableCell>
  );
};

export const health: Renderer<TResource> = (
  resource: TResource,
  __: Resource,
  _: PFBadgeType,
  healthI?: Health,
) => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Health_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle' }}
      align="center"
    >
      {healthI && <HealthIndicator id={resource.name} health={healthI} />}
    </TableCell>
  );
};

export const details: Renderer<WorkloadListItem | ServiceListItem> = (
  resource: WorkloadListItem | ServiceListItem,
) => {
  const isAmbientWaypoint = isWaypoint(resource.labels);

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Details_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}
    >
      <ul>
        {resource.istioReferences?.length > 0 &&
          resource.istioReferences.map(ir => (
            <li
              key={
                ir.namespace
                  ? `${ir.objectGVK.Kind}_${ir.name}_${ir.namespace}`
                  : ir.name
              }
              style={{ marginBottom: '0.125rem' }}
            >
              <PFBadge
                badge={PFBadges[ir.objectGVK.Kind as string]}
                position={topPosition}
              />
              {ir.name}
            </li>
          ))}
        {isAmbientWaypoint && (
          <li style={{ marginBottom: '0.125rem' }}>
            <PFBadge badge={PFBadges.Waypoint} position={topPosition} />
            Waypoint Proxy
            <Tooltip
              key="tooltip_missing_label"
              title="Layer 7 service Mesh capabilities in Istio Ambient"
            >
              <KialiIcon.Info className={infoStyle} />
            </Tooltip>
          </li>
        )}
      </ul>
    </TableCell>
  );
};

export const tls: Renderer<NamespaceInfo> = (ns: NamespaceInfo) => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtualItem_tls_${ns.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      {ns.tlsStatus ? (
        <NamespaceMTLSStatus status={ns.tlsStatus.status} />
      ) : undefined}
    </TableCell>
  );
};

export const serviceConfiguration: Renderer<ServiceListItem> = (
  resource: ServiceListItem,
  _: Resource,
) => {
  const validation = resource.validation;

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Conf_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle' }}
      align="center"
    >
      {validation ? (
        <ValidationServiceSummary
          id={`${item.name}-service-validation`}
          validations={[validation]}
        />
      ) : (
        <>N/A</>
      )}
    </TableCell>
  );
};

export const istioConfiguration: Renderer<IstioConfigItem> = (
  resource: IstioConfigItem,
  _: Resource,
) => {
  const validation = resource.validation;
  const reconciledCondition = getReconciliationCondition(resource);

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Conf_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      {validation ? (
        <Link to="">
          <ValidationObjectSummary
            id={`${item.name}-config-validation`}
            validations={[validation]}
            reconciledCondition={reconciledCondition}
          />
        </Link>
      ) : (
        <>N/A</>
      )}
    </TableCell>
  );
};

export const workloadType: Renderer<WorkloadListItem> = (
  resource: WorkloadListItem,
) => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_WorkloadType_${resource.namespace}_${item.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      {resource.type}
    </TableCell>
  );
};

export const istioType: Renderer<IstioConfigItem> = (
  resource: IstioConfigItem,
) => {
  const type = resource.kind;

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_IstioType_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      {type}
    </TableCell>
  );
};

export const nsItem: Renderer<NamespaceInfo> = (
  ns: NamespaceInfo,
  _config: Resource,
  badge: PFBadgeType,
) => {
  // TODO: Status
  const istioStatus: ComponentStatus[] = [];

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_NamespaceItem_${ns.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      <PFBadge badge={badge} />
      {ns.name}
      {ns.name === serverConfig.istioNamespace && (
        <ControlPlaneBadge
          cluster={ns.cluster}
          annotations={ns.annotations}
          status={istioStatus}
        />
      )}
    </TableCell>
  );
};

export const istioConfig: Renderer<NamespaceInfo> = (ns: NamespaceInfo) => {
  let validations: ValidationStatus = {
    objectCount: 0,
    errors: 0,
    warnings: 0,
  };

  if (!!ns.validations) {
    validations = ns.validations;
  }

  const status = (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_IstioConfig_${ns.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      <ValidationSummary
        id={`ns-val-${ns.name}`}
        errors={validations.errors}
        warnings={validations.warnings}
        objectCount={validations.objectCount}
      />
    </TableCell>
  );

  return status;
};

export const status: Renderer<NamespaceInfo> = (ns: NamespaceInfo) => {
  if (ns.status) {
    return (
      <TableCell
        role="gridcell"
        key={`VirtuaItem_Status_${ns.name}`}
        style={{ verticalAlign: 'middle' }}
      >
        <OverviewCardSparklineCharts
          istioAPIEnabled={false}
          key={`${ns.name}_chart`}
          name={ns.name}
          annotations={ns.annotations}
          duration={30} // TODO
          direction="inbound" // TODO
          metrics={ns.metrics}
          errorMetrics={ns.errorMetrics}
          controlPlaneMetrics={ns.controlPlaneMetrics}
        />
      </TableCell>
    );
  }

  return <TableCell role="gridcell" key={`VirtuaItem_Status_${ns.name}`} />;
};
