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
import { Health as HealthT } from '@backstage-community/plugin-kiali-common/func';
import { DRAWER } from '@backstage-community/plugin-kiali-common/types';
import type {
  AppWorkload,
  HealthSubItem,
  Workload,
} from '@backstage-community/plugin-kiali-common/types';
import { Tooltip } from '@material-ui/core';
import { default as React } from 'react';
import { isMultiCluster, serverConfig } from '../../config';
import { createIcon, KialiIcon } from '../../config/KialiIcon';
import { isGateway, isWaypoint } from '../../helpers/LabelFilterHelper';
import { healthIndicatorStyle } from '../../styles/HealthStyle';
import { kialiStyle } from '../../styles/StyleUtils';
import { BackstageObjectLink } from '../../utils/backstageLinks';
import { renderTrafficStatus } from '../Health/HealthDetails';
import { MissingSidecar } from '../MissingSidecar/MissingSidecar';
import { PFBadge, PFBadges } from '../Pf/PfBadges';

type Props = {
  entity?: boolean;
  apps?: string[];
  cluster?: string;
  health?: HealthT;
  namespace: string;
  services?: string[];
  waypointWorkloads?: Workload[];
  workloads?: AppWorkload[];
  view?: string;
};

const iconStyle = kialiStyle({
  margin: 0,
  padding: 0,
  display: 'inline-block',
});

const resourceListStyle = kialiStyle({
  margin: '0 0 0.5rem 0',
  $nest: {
    '& > span': {
      float: 'left',
      width: '125px',
      fontWeight: 700,
    },
  },
});

const containerStyle = kialiStyle({
  margin: '1rem 0 0.5rem 0',
});

const itemStyle = kialiStyle({
  paddingBottom: '0.25rem',
});

const infoStyle = kialiStyle({
  marginLeft: '0.5rem',
});

export const renderWaypoint = (bgsize?: string): React.ReactNode => {
  const badgeSize = bgsize === 'global' || bgsize === 'sm' ? bgsize : 'global';
  return [
    <div key="waypoint-workloads-title">
      <PFBadge badge={PFBadges.Waypoint} position="top" size={badgeSize} />
      Waypoint proxy
      <Tooltip title="This workload is identified as a waypoint proxy, as part of Istio Ambient">
        <KialiIcon.Info className={infoStyle} />
      </Tooltip>
    </div>,
  ];
};

export const DetailDescription: React.FC<Props> = (props: Props) => {
  const renderAppItem = (
    namespace: string,
    appName: string,
  ): React.ReactNode => {
    let link: React.ReactNode;

    link = (
      <BackstageObjectLink
        entity={props.entity}
        namespace={namespace}
        type="applications"
        query={
          props.cluster && isMultiCluster ? `clusterName=${props.cluster}` : ''
        }
        name={appName}
      >
        {appName}
      </BackstageObjectLink>
    );

    let href = `/namespaces/${namespace}/applications/${appName}`;

    if (props.cluster && isMultiCluster) {
      href = `${href}?clusterName=${props.cluster}`;
    }

    if (props.view === DRAWER) {
      link = <span>{appName}</span>;
    }

    return (
      <li
        key={`App_${namespace}_${appName}`}
        data-test={`App_${namespace}_${appName}`}
        className={itemStyle}
      >
        <div className={iconStyle}>
          <PFBadge badge={PFBadges.App} position="top" />
        </div>

        <span>{link}</span>
      </li>
    );
  };

  const renderServiceItem = (
    namespace: string,
    serviceName: string,
  ): React.ReactNode => {
    let link: React.ReactNode;

    link = (
      <BackstageObjectLink
        entity={props.entity}
        namespace={namespace}
        type="services"
        query={
          props.cluster && isMultiCluster ? `clusterName=${props.cluster}` : ''
        }
        name={serviceName}
      >
        {serviceName}
      </BackstageObjectLink>
    );

    if (props.view === DRAWER) {
      let href = `/namespaces/${namespace}/services/${serviceName}`;

      if (props.cluster && isMultiCluster) {
        href = `${href}?clusterName=${props.cluster}`;
      }

      link = <span>{serviceName}</span>;
    }

    return (
      <li
        key={`Service_${serviceName}`}
        data-test={`Service_${serviceName}`}
        className={itemStyle}
      >
        <div className={iconStyle}>
          <PFBadge badge={PFBadges.Service} position="top" />
        </div>

        <span>{link}</span>
      </li>
    );
  };

  const renderEmptyItem = (type: string): React.ReactNode => {
    const message = `No ${type} found`;

    return <div> {message} </div>;
  };

  const appList = (): React.ReactNode => {
    const applicationList =
      props.apps && props.apps.length > 0
        ? props.apps
            .sort((a1: string, a2: string) => (a1 < a2 ? -1 : 1))
            .filter(name => {
              if (name === undefined) {
                return null;
              }

              return name;
            })
            .map(name => renderAppItem(props.namespace, name))
        : renderEmptyItem('applications');

    return [
      <div key="app-list" className={resourceListStyle}>
        <ul id="app-list" style={{ listStyleType: 'none' }}>
          {applicationList}
        </ul>
      </div>,
    ];
  };

  const renderServiceAccounts = (
    workload: AppWorkload,
  ): NonNullable<React.ReactNode> => {
    return (
      <div style={{ textAlign: 'left' }}>
        {workload.serviceAccountNames &&
        workload.serviceAccountNames.length > 0 ? (
          <div key="properties-list" className={resourceListStyle}>
            <span>Service accounts</span>

            <ul>
              {workload.serviceAccountNames.map((serviceAccount, _) => (
                <li key={serviceAccount} className={itemStyle}>
                  {serviceAccount}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          'Not found'
        )}
      </div>
    );
  };

  const renderWorkloadItem = (workload: AppWorkload): React.ReactNode => {
    let link: React.ReactNode;

    link = (
      <BackstageObjectLink
        entity={props.entity}
        namespace={props.namespace}
        type="workloads"
        query={
          props.cluster && isMultiCluster ? `clusterName=${props.cluster}` : ''
        }
        name={workload.workloadName}
      >
        {workload.workloadName}
      </BackstageObjectLink>
    );

    if (props.view === DRAWER) {
      let href = `/namespaces/${props.namespace}/workloads/${workload.workloadName}`;

      if (props.cluster && isMultiCluster) {
        href = `${href}?clusterName=${props.cluster}`;
      }

      link = <span>{workload.workloadName}</span>;
    }

    return (
      <span key={`WorkloadItem_${workload.workloadName}`}>
        <div className={iconStyle}>
          <PFBadge badge={PFBadges.Workload} position="top" />
        </div>
        {link}
        <Tooltip title={renderServiceAccounts(workload)}>
          <KialiIcon.Info className={infoStyle} />
        </Tooltip>
        {((!workload.istioSidecar &&
          !workload.istioAmbient &&
          !isWaypoint(workload.labels) &&
          serverConfig.ambientEnabled) ||
          (!workload.istioSidecar && !serverConfig.ambientEnabled)) && (
          <MissingSidecar
            namespace={props.namespace}
            isGateway={isGateway(workload.labels)}
            tooltip
            text=""
          />
        )}
      </span>
    );
  };

  const renderWorkloadHealthItem = (sub: HealthSubItem): React.ReactNode => {
    let workload: AppWorkload | undefined = undefined;

    if (props.workloads && props.workloads.length > 0) {
      for (const wk of props.workloads) {
        const hWorkload = sub.text.substring(0, sub.text.indexOf(':'));

        if (hWorkload === wk.workloadName) {
          workload = wk;
          break;
        }
      }
    }

    if (workload) {
      let link: React.ReactNode;

      if (props.view === DRAWER) {
        let href = `/namespaces/${props.namespace}/workloads/${workload.workloadName}`;

        if (props.cluster && isMultiCluster) {
          href = `${href}?clusterName=${props.cluster}`;
        }

        link = <span>{workload.workloadName}</span>;
      } else {
        link = (
          <BackstageObjectLink
            entity={props.entity}
            namespace={props.namespace}
            type="workloads"
            query={
              props.cluster && isMultiCluster
                ? `clusterName=${props.cluster}`
                : ''
            }
            name={workload.workloadName}
          >
            {workload.workloadName}
          </BackstageObjectLink>
        );
      }

      return (
        <span key={`WorkloadItem_${workload.workloadName}`}>
          <div className={iconStyle}>
            <PFBadge badge={PFBadges.Workload} position="top" />
          </div>

          {link}

          <Tooltip title={renderServiceAccounts(workload)}>
            <KialiIcon.Info className={infoStyle} />
          </Tooltip>

          <Tooltip
            aria-label="Health indicator"
            title={<>{sub.text}</>}
            className={healthIndicatorStyle}
          >
            <span style={{ marginLeft: '0.5rem' }}>
              {createIcon(sub.status)}
            </span>
          </Tooltip>

          {((!workload.istioSidecar &&
            !workload.istioAmbient &&
            serverConfig.ambientEnabled) ||
            (!workload.istioSidecar && !serverConfig.ambientEnabled)) && (
            <MissingSidecar
              namespace={props.namespace}
              isGateway={isGateway(workload.labels)}
              tooltip
              text=""
            />
          )}
        </span>
      );
    }
    return (
      <span key={`WorkloadItem_${sub.text}`}>
        <span style={{ marginRight: '0.5rem' }}>{createIcon(sub.status)}</span>
        {sub.text}
      </span>
    );
  };

  const renderWorkloadStatus = (): React.ReactNode => {
    if (props.health) {
      const item = props.health.getWorkloadStatus();

      if (item) {
        return (
          <div>
            {item.text}

            {item.children && (
              <ul id="workload-list" style={{ listStyleType: 'none' }}>
                {item.children.map((sub, _) => {
                  return (
                    <li key={sub.value} className={itemStyle}>
                      {renderWorkloadHealthItem(sub)}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      }
      return (
        <div>
          <ul id="workload-list" style={{ listStyleType: 'none' }}>
            {props.workloads
              ? props.workloads
                  .sort((w1: AppWorkload, w2: AppWorkload) =>
                    w1.workloadName < w2.workloadName ? -1 : 1,
                  )
                  .map((wkd, _) => {
                    return (
                      <li key={wkd.workloadName} className={itemStyle}>
                        {renderWorkloadItem(wkd)}
                      </li>
                    );
                  })
              : undefined}
          </ul>
        </div>
      );
    }
    return undefined;
  };

  const workloadSummary = (): React.ReactNode => {
    return <div className={resourceListStyle}>{renderWorkloadStatus()}</div>;
  };

  const serviceList = (): React.ReactNode => {
    const serviceListT =
      props.services && props.services.length > 0
        ? props.services
            .sort((s1: string, s2: string) => (s1 < s2 ? -1 : 1))
            .map(name => renderServiceItem(props.namespace, name))
        : renderEmptyItem('services');

    return [
      <div key="service-list" className={resourceListStyle}>
        <ul id="service-list" style={{ listStyleType: 'none' }}>
          {serviceListT}
        </ul>
      </div>,
    ];
  };

  return (
    <div className={containerStyle}>
      {props.apps !== undefined && appList()}
      {props.workloads !== undefined && workloadSummary()}
      {props.services !== undefined && serviceList()}
      {props.health && renderTrafficStatus(props.health)}
      {props.waypointWorkloads && renderWaypoint()}
    </div>
  );
};
