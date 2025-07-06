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
import { ListItem, ListItemText } from '@material-ui/core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import { default as React } from 'react';
import { PFColors } from '../Pf/PfColors';

type Props = {
  componentStatus: ComponentStatus;
};

export type ComponentIcon = {
  color: string;
  icon: React.ComponentClass<SVGIconProps>;
};

const ErrorCoreComponent: ComponentIcon = {
  color: PFColors.Danger,
  icon: ExclamationCircleIcon,
};

const ErrorAddonComponent: ComponentIcon = {
  color: PFColors.Warning,
  icon: ExclamationTriangleIcon,
};

const NotReadyComponent: ComponentIcon = {
  color: PFColors.Info,
  icon: MinusCircleIcon,
};

const SuccessComponent: ComponentIcon = {
  color: PFColors.Success,
  icon: CheckCircleIcon,
};

// Mapping Valid-Core to Icon representation.
const validToIcon: { [valid: string]: ComponentIcon } = {
  'false-false': ErrorAddonComponent,
  'false-true': ErrorCoreComponent,
  'true-false': SuccessComponent,
  'true-true': SuccessComponent,
};

const statusMsg = {
  [Status.NotFound]: 'Not found',
  [Status.NotReady]: 'Not ready',
  [Status.Unhealthy]: 'Not healthy',
  [Status.Unreachable]: 'Unreachable',
  [Status.Healthy]: 'Healthy',
};

export const IstioComponentStatus = (props: Props): JSX.Element => {
  const renderIcon = (status: Status, isCore: boolean) => {
    let compIcon = validToIcon[`${status === Status.Healthy}-${isCore}`];
    if (status === Status.NotReady) {
      compIcon = NotReadyComponent;
    }
    const IconComponent = compIcon.icon;
    return <IconComponent style={{ color: compIcon.color, marginTop: 5 }} />;
  };

  const comp = props.componentStatus;
  const state = statusMsg[comp.status];
  return (
    <ListItem>
      <ListItemText
        primary={
          <>
            <span>
              {renderIcon(
                props.componentStatus.status,
                props.componentStatus.is_core,
              )}
            </span>
            <span style={{ marginLeft: '10px', marginRight: '10px' }}>
              {comp.name}
            </span>
            {state && <>{state}</>}
          </>
        }
      />
    </ListItem>
  );
};
