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
import type { AppWorkload } from '@backstage-community/plugin-kiali-common/types';
import {
  ServiceDetailsInfo,
  WorkloadOverviewServiceView,
} from '@backstage-community/plugin-kiali-common/types';
import {
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { default as React } from 'react';
import { HistoryManager } from '../../app/History';
import { DetailDescription } from '../../components/DetailDescription/DetailDescription';
import { HealthIndicator } from '../../components/Health/HealthIndicator';
import { Labels } from '../../components/Label/Labels';
import { renderAPILogo } from '../../components/Logos/Logos';
import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { TextOrLink } from '../../components/TextOrLink';
import { LocalTime } from '../../components/Time/LocalTime';
import { isMultiCluster, serverConfig } from '../../config';
import { KialiIcon } from '../../config/KialiIcon';
import { cardsHeight, kialiStyle } from '../../styles/StyleUtils';

interface ServiceInfoDescriptionProps {
  namespace: string;
  serviceDetails?: ServiceDetailsInfo;
  view?: string;
}

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

const iconStyle = kialiStyle({
  display: 'inline-block',
});

const infoStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.125rem',
});

const healthIconStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.075rem',
});

const additionalItemStyle = kialiStyle({
  display: 'flex',
  alignItems: 'center',
});

export const ServiceDescription: React.FC<ServiceInfoDescriptionProps> = (
  props: ServiceInfoDescriptionProps,
) => {
  const apps: string[] = [];
  const workloads: AppWorkload[] = [];
  const cluster = HistoryManager.getClusterName();
  if (props.serviceDetails) {
    if (props.serviceDetails.workloads) {
      props.serviceDetails.workloads
        .sort(
          (w1: WorkloadOverviewServiceView, w2: WorkloadOverviewServiceView) =>
            w1.name < w2.name ? -1 : 1,
        )
        .forEach(wk => {
          if (wk.labels) {
            const appName = wk.labels[serverConfig.istioLabels.appLabelName];

            if (!apps.includes(appName)) {
              apps.push(appName);
            }
          }

          workloads.push({
            workloadName: wk.name,
            istioSidecar: wk.istioSidecar,
            istioAmbient: wk.istioAmbient,
            serviceAccountNames: wk.serviceAccountNames,
            labels: wk.labels ?? {},
          });
        });
    }
  }

  // We will show service labels only when there is some label that is not present in the selector
  let showServiceLabels = false;

  if (
    props.serviceDetails &&
    props.serviceDetails.service?.labels &&
    props.serviceDetails.service?.selectors
  ) {
    const keys = Object.keys(props.serviceDetails.service.labels);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = props.serviceDetails.service.labels[key];

      if (props.serviceDetails.service.selectors[key] !== value) {
        showServiceLabels = true;
        break;
      }
    }
  }

  const serviceProperties = (
    <div key="properties-list" className={resourceListStyle}>
      <ul style={{ listStyleType: 'none' }}>
        {props.serviceDetails && (
          <li>
            <span>Created</span>

            <div style={{ display: 'inline-block' }}>
              <LocalTime time={props.serviceDetails.service?.createdAt} />
            </div>
          </li>
        )}

        {props.serviceDetails && (
          <li>
            <span>Version</span>
            {props.serviceDetails.service?.resourceVersion}
          </li>
        )}

        {props.serviceDetails?.service?.additionalDetails?.map(
          (additionalItem, idx) => {
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
          },
        )}
      </ul>
    </div>
  );

  const serviceName = props.serviceDetails
    ? props.serviceDetails.service?.name
    : 'Service';
  let serviceBadge = PFBadges.Service;

  if (props.serviceDetails && props.serviceDetails.service) {
    switch (props.serviceDetails.service.type) {
      case 'External':
        serviceBadge = PFBadges.ExternalService;
        break;
      case 'Federation':
        serviceBadge = PFBadges.FederatedService;
        break;
      default:
        serviceBadge = PFBadges.Service;
    }
  }

  return (
    <Card id="ServiceDescriptionCard" style={{ height: cardsHeight }}>
      <CardHeader
        title={
          <>
            <Typography variant="h6">
              <div key="service-icon" className={iconStyle}>
                <PFBadge badge={serviceBadge} position="top" />
              </div>

              {serviceName}

              <Tooltip
                title={
                  <div style={{ textAlign: 'left' }}>{serviceProperties}</div>
                }
              >
                <>
                  <KialiIcon.Info className={infoStyle} />
                </>
              </Tooltip>

              <span className={healthIconStyle}>
                <HealthIndicator
                  id={serviceName}
                  health={
                    props.serviceDetails
                      ? props.serviceDetails.health
                      : undefined
                  }
                />
              </span>
            </Typography>

            {cluster && isMultiCluster && (
              <div key="cluster-icon" className={iconStyle}>
                <PFBadge badge={PFBadges.Cluster} position="right" /> {cluster}
              </div>
            )}
          </>
        }
      />

      <CardContent>
        {props.serviceDetails && showServiceLabels && (
          <Labels
            labels={props.serviceDetails.service.labels}
            tooltipMessage="Labels defined on the Service"
          />
        )}

        {props.serviceDetails && (
          <Labels
            labels={props.serviceDetails.service?.selectors}
            tooltipMessage={`Labels defined on the ${
              showServiceLabels ? 'Selector' : 'Service and Selector'
            }`}
          />
        )}

        <DetailDescription
          namespace={props.namespace}
          apps={apps}
          workloads={workloads}
          health={props.serviceDetails?.health}
          cluster={cluster}
          view={props.view}
        />
      </CardContent>
    </Card>
  );
};
