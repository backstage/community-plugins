/*
 * Copyright 2025 The Backstage Authors
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
import React, { ReactNode } from 'react';
import { usePermission } from '@backstage/plugin-permission-react';
import { Progress, WarningPanel } from '@backstage/core-components';
import {
  kubernetesClustersReadPermission,
  kubernetesResourcesReadPermission,
} from '@backstage/plugin-kubernetes-common';

export type RequireKubernetesPermissionProps = {
  children: ReactNode;
};

export function RequireKubernetesReadPermissions(
  props: RequireKubernetesPermissionProps,
): JSX.Element | null {
  const kubernetesClustersReadPermissionResult = usePermission({
    permission: kubernetesClustersReadPermission,
  });
  const kubernetesResourcesReadPermissionResult = usePermission({
    permission: kubernetesResourcesReadPermission,
  });

  if (
    kubernetesClustersReadPermissionResult.loading ||
    kubernetesResourcesReadPermissionResult.loading
  ) {
    return (
      <div data-testid="topology-progress">
        <Progress />
      </div>
    );
  }

  if (
    kubernetesClustersReadPermissionResult.allowed &&
    kubernetesResourcesReadPermissionResult.allowed
  ) {
    return <>{props.children}</>;
  }

  const requiredPermissions = [
    kubernetesClustersReadPermission,
    kubernetesResourcesReadPermission,
  ]
    .map(p => `'${p.name}'`)
    .join(', ');

  return (
    <WarningPanel
      title="Permission required"
      message={`To view Topology, contact your administrator to give you the following permission(s): ${requiredPermissions}.`}
    />
  );
}
