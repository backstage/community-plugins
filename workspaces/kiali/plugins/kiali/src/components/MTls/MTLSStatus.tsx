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
import { TooltipPosition } from '@patternfly/react-core';
import { default as React } from 'react';
import { MTLSIcon } from './MTLSIcon';

type Props = {
  status: string;
  statusDescriptors: Map<string, StatusDescriptor>;
  className?: string;
  overlayPosition?: TooltipPosition;
};

export type StatusDescriptor = {
  message: string;
  icon: string;
  showStatus: boolean;
};

export const emptyDescriptor = {
  message: '',
  icon: '',
  showStatus: false,
};

export class MTLSStatus extends React.Component<Props> {
  statusDescriptor() {
    return (
      this.props.statusDescriptors.get(this.props.status) || emptyDescriptor
    );
  }

  icon() {
    return this.statusDescriptor().icon;
  }

  message() {
    return this.statusDescriptor().message;
  }

  showStatus() {
    return this.statusDescriptor().showStatus;
  }

  overlayPosition() {
    return this.props.overlayPosition || TooltipPosition.left;
  }

  iconClassName() {
    return this.props.className || '';
  }

  render() {
    if (this.showStatus()) {
      return (
        <MTLSIcon
          icon={this.icon()}
          iconClassName={this.iconClassName()}
          tooltipText={this.message()}
          tooltipPosition={this.overlayPosition()}
        />
      );
    }

    return null;
  }
}
