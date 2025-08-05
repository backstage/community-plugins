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
import type { App } from '@backstage-community/plugin-kiali-common/types';
import { Card, CardContent, CardHeader, Typography } from '@material-ui/core';
import { default as React } from 'react';
import { DetailDescription } from '../../components/DetailDescription/DetailDescription';
import { HealthIndicator } from '../../components/Health/HealthIndicator';
import { Labels } from '../../components/Label/Labels';
import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { isMultiCluster, serverConfig } from '../../config';
import { cardsHeight, kialiStyle } from '../../styles/StyleUtils';

type AppDescriptionProps = {
  app?: App;
  health?: Health;
  view?: string;
};

const iconStyle = kialiStyle({
  display: 'inline-block',
});

const healthIconStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.075rem',
});

export const AppDescription: React.FC<AppDescriptionProps> = (
  props: AppDescriptionProps,
) => {
  const appLabels: { [key: string]: string } = {};

  if (props.app) {
    appLabels[serverConfig.istioLabels.appLabelName] = props.app.name;
  }

  return props.app ? (
    <Card
      id="AppDescriptionCard"
      data-test="app-description-card"
      style={{ height: cardsHeight }}
    >
      <CardHeader
        title={
          <>
            <Typography variant="h6">
              <div key="service-icon" className={iconStyle}>
                <PFBadge badge={PFBadges.App} />
              </div>

              {props.app.name}

              <span className={healthIconStyle}>
                <HealthIndicator id={props.app.name} health={props.health} />
              </span>
            </Typography>

            {props.app.cluster && isMultiCluster && (
              <div key="cluster-icon" style={{ paddingBottom: '0.5rem' }}>
                <PFBadge badge={PFBadges.Cluster} /> {props.app.cluster}
              </div>
            )}
          </>
        }
      />
      <CardContent>
        <Labels
          labels={appLabels}
          tooltipMessage={`Workloads and Services grouped by ${serverConfig.istioLabels.appLabelName} label`}
        />

        <DetailDescription
          namespace={props.app ? props.app.namespace.name : ''}
          workloads={props.app ? props.app.workloads : []}
          services={props.app ? props.app.serviceNames : []}
          health={props.health}
          cluster={props.app?.cluster}
          view={props.view}
        />
      </CardContent>
    </Card>
  ) : (
    <>Loading</>
  );
};
