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
import type {
  CanaryUpgradeStatus,
  ComponentStatus,
} from '@backstage-community/plugin-kiali-common/types';
import { CardHeader, Chip } from '@material-ui/core';
import { serverConfig } from '../../../config';
import { NamespaceInfo } from '../NamespaceInfo';
import { ControlPlaneBadge } from './ControlPlaneBadge';
import { ControlPlaneVersionBadge } from './ControlPlaneVersionBadge';

type NamespaceHeaderProps = {
  namespace: NamespaceInfo;
  istioAPIEnabled?: boolean;
  canaryUpgradeStatus?: CanaryUpgradeStatus;
  istioStatus: ComponentStatus[];
};

export const NamespaceHeader = (props: NamespaceHeaderProps) => {
  const isIstioSystem = serverConfig?.istioNamespace === props.namespace.name;

  const hasCanaryUpgradeConfigured = (): boolean => {
    return props.canaryUpgradeStatus
      ? props.canaryUpgradeStatus.pendingNamespaces.length > 0 ||
          props.canaryUpgradeStatus.migratedNamespaces.length > 0
      : false;
  };
  return (
    <CardHeader
      title={
        <>
          {props.namespace.name}
          {isIstioSystem && (
            <ControlPlaneBadge
              cluster={props.namespace.cluster}
              annotations={props.namespace.annotations}
              status={props.istioStatus}
            />
          )}
          {!props.istioAPIEnabled && (
            <Chip
              label="Istio API disabled"
              style={{ color: 'orange', marginLeft: 10 }}
              size="small"
            />
          )}
        </>
      }
      subheader={
        <>
          {props.namespace.name !== serverConfig?.istioNamespace &&
            hasCanaryUpgradeConfigured() &&
            props.canaryUpgradeStatus?.migratedNamespaces.includes(
              props.namespace.name,
            ) && (
              <ControlPlaneVersionBadge
                version={props.canaryUpgradeStatus.upgradeVersion}
                isCanary
              />
            )}
          {props.namespace.name !== serverConfig?.istioNamespace &&
            hasCanaryUpgradeConfigured() &&
            props.canaryUpgradeStatus?.pendingNamespaces.includes(
              props.namespace.name,
            ) && (
              <ControlPlaneVersionBadge
                version={props.canaryUpgradeStatus.currentVersion}
                isCanary={false}
              />
            )}
          {props.namespace.name === serverConfig?.istioNamespace &&
            !props.istioAPIEnabled && (
              <Chip
                label="Istio API disabled"
                style={{ color: 'orange', marginLeft: 10 }}
                size="small"
              />
            )}
        </>
      }
    />
  );
};
