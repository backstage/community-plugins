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
  CanaryUpgradeStatus,
  CertsInfo,
  DurationInSeconds,
  IntervalInMilliseconds,
  ValidationStatus,
} from '@backstage-community/plugin-kiali-common/types';
import type { ComponentStatus } from '@backstage-community/plugin-kiali-common/types';
import { Card, CardContent, Grid } from '@material-ui/core';
import { default as React } from 'react';
import * as FilterHelper from '../../../components/FilterList/FilterHelper';
import { NamespaceMTLSStatus } from '../../../components/MTls/NamespaceMTLSStatus';
import { TLSInfo } from '../../../components/Overview/TLSInfo';
import { PFBadge, PFBadges } from '../../../components/Pf/PfBadges';
import { ValidationSummary } from '../../../components/Validations/ValidationSummary';
import { isMultiCluster, serverConfig } from '../../../config';
import { NamespaceInfo, NamespaceInfoStatus } from '../NamespaceInfo';
import { DirectionType, OverviewType } from '../OverviewToolbar';
import { CanaryUpgradeProgress } from './CanaryUpgradeProgress';
import { ControlPlaneNamespaceStatus } from './ControlPlaneNamespaceStatus';
import { NamespaceHeader } from './NamespaceHeader';
import { NamespaceLabels } from './NamespaceLabels';
import { NamespaceStatus } from './NamespaceStatus';
import { OverviewCardSparklineCharts } from './OverviewCardSparklineCharts';

type OverviewCardProps = {
  namespace: NamespaceInfo;
  entity?: boolean;
  canaryUpgradeStatus?: CanaryUpgradeStatus;
  duration: DurationInSeconds;
  refreshInterval: IntervalInMilliseconds;
  istioAPIEnabled?: boolean;
  type: OverviewType;
  direction: DirectionType;
  certsInfo: CertsInfo[];
  minTLS: string;
  istioStatus: ComponentStatus[];
  healthNs?: NamespaceInfoStatus;
};

export const OverviewCard = (props: OverviewCardProps) => {
  const isIstioSystem = serverConfig?.istioNamespace === props.namespace.name;

  const hasCanaryUpgradeConfigured = (): boolean => {
    return props.canaryUpgradeStatus
      ? props.canaryUpgradeStatus.pendingNamespaces.length > 0 ||
          props.canaryUpgradeStatus.migratedNamespaces.length > 0
      : false;
  };

  const renderCharts = (): React.JSX.Element => {
    // Don't render charts if serverConfig is not available
    if (!serverConfig || !serverConfig.durations) {
      return <div>Loading...</div>;
    }

    const chart = (
      <OverviewCardSparklineCharts
        key={props.namespace.name}
        name={props.namespace.name}
        annotations={props.namespace.annotations}
        duration={FilterHelper.currentDuration()}
        istioAPIEnabled={props.istioAPIEnabled || false}
        direction={props.direction}
        metrics={props.namespace.metrics}
        errorMetrics={props.namespace.errorMetrics}
        controlPlaneMetrics={props.namespace.controlPlaneMetrics}
      />
    );
    const canaryConfigured = hasCanaryUpgradeConfigured();
    return isIstioSystem ? (
      <Grid container>
        {canaryConfigured && (
          <Grid item md={props.istioAPIEnabled ? 2 : 12}>
            <CanaryUpgradeProgress
              canaryUpgradeStatus={props.canaryUpgradeStatus!}
            />
          </Grid>
        )}
        <Grid item md={canaryConfigured ? 10 : 12}>
          {chart}
        </Grid>
      </Grid>
    ) : (
      chart
    );
  };

  const renderIstioConfigStatus = (ns: NamespaceInfo): React.JSX.Element => {
    let validations: ValidationStatus = {
      objectCount: 0,
      errors: 0,
      warnings: 0,
    };
    if (!!ns.validations) {
      validations = ns.validations;
    }

    return (
      <ValidationSummary
        id={`ns-val-${ns.name}`}
        errors={validations.errors}
        warnings={validations.warnings}
        objectCount={validations.objectCount}
        data-test="validation-summary"
      />
    );
  };

  return (
    <Card data-test={`overview-card-${props.namespace.name}`}>
      {!props.entity && <NamespaceHeader {...props} />}
      <CardContent>
        {!props.entity && isMultiCluster && props.namespace.cluster && (
          <>
            <PFBadge badge={PFBadges.Cluster} position="right" />
            {props.namespace.cluster}
          </>
        )}
        <Grid container>
          <Grid item xs={3}>
            {!props.entity && (
              <>
                <NamespaceLabels labels={props.namespace.labels} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'inline-block', width: '125px' }}>
                    Istio config
                  </div>
                  {props.namespace.tlsStatus && (
                    <span>
                      <NamespaceMTLSStatus
                        status={props.namespace.tlsStatus!.status}
                      />
                    </span>
                  )}
                  {props.istioAPIEnabled
                    ? renderIstioConfigStatus(props.namespace)
                    : 'N/A'}
                </div>
              </>
            )}
            {!props.entity && <NamespaceStatus {...props} />}
            {isIstioSystem && (
              <>
                <ControlPlaneNamespaceStatus namespace={props.namespace} />
                <TLSInfo version={props.minTLS} />
              </>
            )}
          </Grid>
          <Grid item xs={isIstioSystem ? 9 : 12}>
            {renderCharts()}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
