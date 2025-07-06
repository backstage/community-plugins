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
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { default as React } from 'react';
import fullIconDark from '../../assets/img/mtls-status-full-dark.svg';
import fullIcon from '../../assets/img/mtls-status-full.svg';
import hollowIconDark from '../../assets/img/mtls-status-partial-dark.svg';
import hollowIcon from '../../assets/img/mtls-status-partial.svg';

export { fullIcon, hollowIcon, fullIconDark, hollowIconDark };

type Props = {
  icon: string;
  iconClassName: string;
  tooltipText: string;
  tooltipPosition: TooltipPosition;
};

export enum MTLSIconTypes {
  LOCK_FULL = 'LOCK_FULL',
  LOCK_HOLLOW = 'LOCK_HOLLOW',
  LOCK_FULL_DARK = 'LOCK_FULL_DARK',
  LOCK_HOLLOW_DARK = 'LOCK_HOLLOW_DARK',
}

const nameToSource = new Map<string, string>([
  [MTLSIconTypes.LOCK_FULL, fullIcon],
  [MTLSIconTypes.LOCK_FULL_DARK, fullIconDark],
  [MTLSIconTypes.LOCK_HOLLOW, hollowIcon],
  [MTLSIconTypes.LOCK_HOLLOW_DARK, hollowIconDark],
]);

export class MTLSIcon extends React.Component<Props> {
  render() {
    return (
      <Tooltip
        aria-label="mTLS status"
        position={this.props.tooltipPosition}
        enableFlip
        content={this.props.tooltipText}
      >
        <img
          className={this.props.iconClassName}
          src={nameToSource.get(this.props.icon)}
          alt={this.props.tooltipPosition}
        />
      </Tooltip>
    );
  }
}
