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
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';
import { default as React } from 'react';
import { IstioStatus } from './IstioStatus';

type Props = {
  status: ComponentStatus[];
  cluster?: string;
};

export const IstioStatusInline = (props: Props): React.JSX.Element => {
  return (
    <IstioStatus
      {...props}
      icons={{
        ErrorIcon: ExclamationCircleIcon,
        HealthyIcon: CheckCircleIcon,
        InfoIcon: MinusCircleIcon,
        WarningIcon: ExclamationTriangleIcon,
      }}
    />
  );
};
