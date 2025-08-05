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
import { MTLSStatuses } from '@backstage-community/plugin-kiali-common/types';
import { default as React } from 'react';
import { kialiStyle } from '../../styles/StyleUtils';
import { MTLSIconTypes } from './MTLSIcon';
import { emptyDescriptor, MTLSStatus, StatusDescriptor } from './MTLSStatus';

type Props = {
  status: string;
};

const statusDescriptors = new Map<string, StatusDescriptor>([
  [
    MTLSStatuses.ENABLED,
    {
      message: 'mTLS is enabled for this namespace',
      icon: MTLSIconTypes.LOCK_FULL_DARK,
      showStatus: true,
    },
  ],
  [
    MTLSStatuses.ENABLED_EXTENDED,
    {
      message:
        'mTLS is enabled for this namespace, extended from Mesh-wide config',
      icon: MTLSIconTypes.LOCK_FULL_DARK,
      showStatus: true,
    },
  ],
  [
    MTLSStatuses.PARTIALLY,
    {
      message: 'mTLS is partially enabled for this namespace',
      icon: MTLSIconTypes.LOCK_HOLLOW_DARK,
      showStatus: true,
    },
  ],
  [MTLSStatuses.DISABLED, emptyDescriptor],
  [MTLSStatuses.NOT_ENABLED, emptyDescriptor],
]);

// Magic style to align Istio Config icons on top of status overview
const iconStyle = kialiStyle({
  marginTop: -3,
  marginRight: 18,
  marginLeft: 2,
  width: 10,
});

export class NamespaceMTLSStatus extends React.Component<Props> {
  render() {
    return (
      <MTLSStatus
        status={this.props.status}
        className={iconStyle}
        statusDescriptors={statusDescriptors}
      />
    );
  }
}
