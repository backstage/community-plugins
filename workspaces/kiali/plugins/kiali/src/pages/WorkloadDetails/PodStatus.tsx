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
import { Tooltip } from '@material-ui/core';
import React from 'react';
import { ValidationStack } from '../../components/Validations/ValidationStack';
import { createIcon } from '../../config/KialiIcon';
import {
  DEGRADED,
  HEALTHY,
  isProxyStatusSynced,
  mergeStatus,
  ProxyStatus,
  Status,
} from '../../types/Health';
import { ObjectCheck, ValidationTypes } from '../../types/IstioObjects';
import { highestSeverity, validationToHealth } from '../../types/ServiceInfo';
import { ProxyStatusList } from './ProxyStatusList';

type PodStatusProps = {
  checks?: ObjectCheck[];
  proxyStatus?: ProxyStatus;
};

export const PodStatus: React.FC<PodStatusProps> = (props: PodStatusProps) => {
  const proxyStatusSeverity: Status =
    props.proxyStatus && !isProxyStatusSynced(props.proxyStatus)
      ? DEGRADED
      : HEALTHY;

  const showTooltip = (): boolean => {
    const validationSeverity: ValidationTypes = highestSeverity(
      props.checks || [],
    );
    return (
      proxyStatusSeverity.name !== HEALTHY.name ||
      validationSeverity !== ValidationTypes.Correct
    );
  };

  if (showTooltip()) {
    const severityIcon = (): Status => {
      const validationSeverity: Status = validationToHealth(
        highestSeverity(props.checks ?? []),
      );
      return mergeStatus(proxyStatusSeverity, validationSeverity);
    };

    const tooltipContent: React.ReactNode = (
      <>
        <ProxyStatusList status={props.proxyStatus} />
        <ValidationStack checks={props.checks} />
      </>
    );

    return (
      <Tooltip aria-label="Pod Status" title={tooltipContent}>
        <span>{createIcon(severityIcon())}</span>
      </Tooltip>
    );
  }
  return createIcon(HEALTHY);
};
