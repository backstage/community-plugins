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
import type { ComponentStatus } from '@backstage-community/plugin-kiali-common/types';
import { StatusTypes as Status } from '@backstage-community/plugin-kiali-common/types';
import { Tooltip } from '@material-ui/core';
import { ResourcesFullIcon } from '@patternfly/react-icons';
import { SVGIconProps } from '@patternfly/react-icons/dist/esm/createIcon';
import { default as React } from 'react';
import { PFColors } from '../Pf/PfColors';
import { IstioStatusList } from './IstioStatusList';

type StatusIcons = {
  ErrorIcon?: React.ComponentClass<SVGIconProps>;
  WarningIcon?: React.ComponentClass<SVGIconProps>;
  InfoIcon?: React.ComponentClass<SVGIconProps>;
  HealthyIcon?: React.ComponentClass<SVGIconProps>;
};

type Props = {
  status: ComponentStatus[];
  icons?: StatusIcons;
  cluster?: string;
};

const ValidToColor = {
  'true-true-true': PFColors.Danger,
  'true-true-false': PFColors.Danger,
  'true-false-true': PFColors.Danger,
  'true-false-false': PFColors.Danger,
  'false-true-true': PFColors.Warning,
  'false-true-false': PFColors.Warning,
  'false-false-true': PFColors.Info,
  'false-false-false': PFColors.Success,
};

const defaultIcons = {
  ErrorIcon: ResourcesFullIcon,
  WarningIcon: ResourcesFullIcon,
  InfoIcon: ResourcesFullIcon,
  HealthyIcon: ResourcesFullIcon,
};

export const IstioStatus = (props: Props): React.JSX.Element => {
  const tooltipContent = () => {
    return <IstioStatusList status={props.status} />;
  };

  const tooltipColor = () => {
    let coreUnhealthy: boolean = false;
    let addonUnhealthy: boolean = false;
    let notReady: boolean = false;

    (props.status || []).forEach(compStatus => {
      const { status, is_core } = compStatus;
      const isNotReady: boolean = status === Status.NotReady;
      const isUnhealthy: boolean = status !== Status.Healthy && !isNotReady;

      if (is_core) {
        coreUnhealthy = coreUnhealthy || isUnhealthy;
      } else {
        addonUnhealthy = addonUnhealthy || isUnhealthy;
      }

      notReady = notReady || isNotReady;
    });

    return ValidToColor[`${coreUnhealthy}-${addonUnhealthy}-${notReady}`];
  };

  const healthyComponents = () => {
    return props.status.reduce(
      (healthy: boolean, compStatus: ComponentStatus) => {
        return healthy && compStatus.status === Status.Healthy;
      },
      true,
    );
  };

  if (healthyComponents()) {
    return <></>;
  }
  const icons = props.icons
    ? { ...defaultIcons, ...props.icons }
    : defaultIcons;
  const iconColor = tooltipColor();
  let Icon: React.ComponentClass<SVGIconProps> = ResourcesFullIcon;
  let dataTestID: string = 'istio-status';

  if (iconColor === PFColors.Danger) {
    Icon = icons.ErrorIcon;
    dataTestID += '-danger';
  } else if (iconColor === PFColors.Warning) {
    Icon = icons.WarningIcon;
    dataTestID += '-warning';
  } else if (iconColor === PFColors.Info) {
    Icon = icons.InfoIcon;
    dataTestID += '-info';
  } else if (iconColor === PFColors.Success) {
    Icon = icons.HealthyIcon;
    dataTestID += '-success';
  }

  return (
    <Tooltip placement="bottom" title={tooltipContent()}>
      <Icon
        color={iconColor}
        style={{ verticalAlign: '-0.2em', marginRight: -8 }}
        data-test={dataTestID}
      />
    </Tooltip>
  );
};
