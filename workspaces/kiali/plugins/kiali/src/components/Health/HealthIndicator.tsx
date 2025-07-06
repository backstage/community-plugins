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
import { Health } from '@backstage-community/plugin-kiali-common/func';
import { NA } from '@backstage-community/plugin-kiali-common/types';
import { PopoverPosition, Tooltip } from '@patternfly/react-core';
import { default as React } from 'react';
import { createTooltipIcon } from '../../config/KialiIcon';
import { HealthDetails } from './HealthDetails';
import { healthIndicatorStyle } from './HealthStyle';
import { createIcon } from './Helper';

interface HealthIndicatorProps {
  health?: Health;
  id: string;
  tooltipPlacement?: PopoverPosition;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = (
  props: HealthIndicatorProps,
) => {
  const globalStatus = props.health ? props.health.getGlobalStatus() : NA;

  if (props.health) {
    const icon = createIcon(globalStatus);

    return (
      <Tooltip
        aria-label="Health indicator"
        content={
          <div>
            <strong>{globalStatus.name}</strong>
            <HealthDetails health={props.health} />
          </div>
        }
        position={PopoverPosition.auto}
        className={healthIndicatorStyle}
      >
        {createTooltipIcon(icon, 'health')}
      </Tooltip>
    );
  }

  return <span />;
};
