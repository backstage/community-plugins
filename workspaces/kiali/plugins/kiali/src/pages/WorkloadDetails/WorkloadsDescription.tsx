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
  Health,
  validationKey,
} from '@backstage-community/plugin-kiali-common/func';
import type { Workload } from '@backstage-community/plugin-kiali-common/types';
import {
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { default as React } from 'react';
import { AmbientLabel } from '../../components/Ambient/AmbientLabel';
import { DetailDescription } from '../../components/DetailDescription/DetailDescription';
import { HealthIndicator } from '../../components/Health/HealthIndicator';
import { Labels } from '../../components/Label/Labels';
import { renderAPILogo, renderRuntimeLogo } from '../../components/Logos/Logos';
import { MissingAuthPolicy } from '../../components/MissingAuthPolicy/MissingAuthPolicy';
import { MissingLabel } from '../../components/MissingLabel/MissingLabel';
import { MissingSidecar } from '../../components/MissingSidecar/MissingSidecar';
import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { TextOrLink } from '../../components/TextOrLink';
import { LocalTime } from '../../components/Time/LocalTime';
import { isMultiCluster, serverConfig } from '../../config';
import { KialiIcon } from '../../config/KialiIcon';
import { isGateway, isWaypoint } from '../../helpers/LabelFilterHelper';
import { cardsHeight, kialiStyle } from '../../styles/StyleUtils';
import { hasMissingAuthPolicy } from '../../utils/IstioConfigUtils';

type WorkloadDescriptionProps = {
  health?: Health;
  entity?: boolean;
  namespace: string;
  workload: Workload;
  view?: string;
};

const resourceListStyle = kialiStyle({
  marginBottom: '0.75rem',
  $nest: {
    '& > ul > li span': {
      float: 'left',
      width: '125px',
      fontWeight: 700,
    },
  },
});

export const iconStyle = kialiStyle({
  display: 'inline-block',
});

export const infoStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.125rem',
  display: 'inline-block',
});

export const healthIconStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.075rem',
});

const additionalItemStyle = kialiStyle({
  display: 'flex',
  alignItems: 'center',
});

const runtimeInfoStyle = kialiStyle({
  display: 'flex',
  alignItems: 'center',
  marginTop: '0.5rem',
});

export const WorkloadDescription: React.FC<WorkloadDescriptionProps> = (
  props: WorkloadDescriptionProps,
) => {
  const workload = props.workload;
  const apps: string[] = [];
  const services: string[] = [];

  if (workload.labels[serverConfig.istioLabels.appLabelName]) {
    apps.push(workload.labels[serverConfig.istioLabels.appLabelName]);
  }

  workload.services?.forEach(s => services.push(s.name));

  const isTemplateLabels =
    workload &&
    [
      'Deployment',
      'ReplicaSet',
      'ReplicationController',
      'DeploymentConfig',
      'StatefulSet',
    ].indexOf(workload.type) >= 0;

  const runtimes = (workload?.runtimes ?? [])
    .map(r => r.name)
    .filter(name => name !== '');

  const workloadProperties = workload ? (
    <>
      <div key="properties-list" className={resourceListStyle}>
        <ul style={{ listStyleType: 'none' }}>
          {workload.istioInjectionAnnotation !== undefined && (
            <li>
              <span>Istio Injection</span>
              {String(workload.istioInjectionAnnotation)}
            </li>
          )}

          <li>
            <span>Type</span>
            {workload.type ? workload.type : 'N/A'}
          </li>

          <li>
            <span>Created</span>
            <div style={{ display: 'inline-block' }}>
              <LocalTime time={workload.createdAt} />
            </div>
          </li>

          <li>
            <span>Version</span>
            {workload.resourceVersion}
          </li>

          {workload.additionalDetails.map((additionalItem, idx) => {
            return (
              <li
                key={`additional-details-${idx}`}
                id={`additional-details-${idx}`}
              >
                <div className={additionalItemStyle}>
                  <span>{additionalItem.title}</span>
                  {additionalItem.icon &&
                    renderAPILogo(additionalItem.icon, undefined, idx)}
                </div>
                <TextOrLink text={additionalItem.value} urlTruncate={64} />
              </li>
            );
          })}

          {runtimes.length > 0 && (
            <li id="runtimes">
              <div className={runtimeInfoStyle}>
                <span>Runtimes</span>
                <div style={{ display: 'inline-block' }}>
                  {runtimes
                    .map((rt, idx) => renderRuntimeLogo(rt, idx))
                    .reduce(
                      (list: React.ReactNode[], elem) =>
                        list.length > 0
                          ? [...list, <span key="sep"> | </span>, elem]
                          : [elem],
                      [],
                    )}
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </>
  ) : undefined;

  return (
    <Card style={{ height: cardsHeight }}>
      <CardHeader
        title={
          <>
            <Typography variant="h6" data-test="workload-title">
              <div key="service-icon" className={iconStyle} data-test="w-badge">
                <PFBadge badge={PFBadges.Workload} position="top" />
              </div>

              {props.workload.name}

              {workloadProperties ? (
                <Tooltip
                  title={
                    <div style={{ textAlign: 'left' }}>
                      {workloadProperties}
                    </div>
                  }
                >
                  <div style={{ display: 'inline-block' }}>
                    <KialiIcon.Info className={infoStyle} />
                  </div>
                </Tooltip>
              ) : undefined}

              <span className={healthIconStyle}>
                <HealthIndicator id={workload.name} health={props.health} />
              </span>

              {!props.workload.istioSidecar &&
                !props.workload.istioAmbient &&
                !isWaypoint(props.workload.labels) && (
                  <MissingSidecar
                    namespace={props.namespace}
                    tooltip
                    text=""
                    isGateway={isGateway(workload.labels)}
                  />
                )}

              {props.workload.istioAmbient &&
                !isWaypoint(props.workload.labels) && (
                  <AmbientLabel
                    tooltip
                    waypoint={
                      props.workload.waypointWorkloads?.length > 0
                        ? true
                        : false
                    }
                  />
                )}

              {hasMissingAuthPolicy(
                validationKey(props.workload.name, props.namespace),
                props.workload.validations,
              ) && (
                <MissingAuthPolicy
                  namespace={props.namespace}
                  tooltip
                  className={infoStyle}
                  text=""
                />
              )}

              {(!props.workload.appLabel || !props.workload.versionLabel) &&
                !isWaypoint(props.workload.labels) && (
                  <MissingLabel
                    missingApp={!props.workload.appLabel}
                    missingVersion={!props.workload.versionLabel}
                    className={infoStyle}
                    tooltip
                  />
                )}
            </Typography>

            {props.workload?.cluster && isMultiCluster && (
              <div key="cluster-icon" className={iconStyle}>
                <PFBadge badge={PFBadges.Cluster} /> {props.workload.cluster}
              </div>
            )}
          </>
        }
      />

      <CardContent>
        {workload.labels && (
          <Labels
            labels={workload.labels}
            tooltipMessage={
              isTemplateLabels
                ? 'Labels defined on the Workload template'
                : undefined
            }
          />
        )}
        <DetailDescription
          namespace={props.namespace}
          entity={props.entity}
          apps={apps}
          services={services}
          health={props.health}
          cluster={props.workload.cluster}
          view={props.view}
          waypointWorkloads={
            isWaypoint(props.workload.labels)
              ? props.workload.waypointWorkloads
              : undefined
          }
        />
      </CardContent>
    </Card>
  );
};
