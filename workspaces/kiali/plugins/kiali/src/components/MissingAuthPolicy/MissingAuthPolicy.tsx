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
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import { default as React } from 'react';
import { icons } from '../../config/Icons';
import { KialiIcon } from '../../config/KialiIcon';
import { isIstioNamespace } from '../../config/ServerConfig';
import { kialiStyle } from '../../styles/StyleUtils';

type MissingAuthPolicyProps = {
  text?: string;
  textTooltip?: string;
  tooltip?: boolean;
  icon?: React.ComponentClass<SVGIconProps>;
  color?: string;
  namespace: string;
  className?: string;
};

const infoStyle = kialiStyle({
  marginLeft: '0.5rem',
});

export const MissingAuthPolicy: React.FC<MissingAuthPolicyProps> = ({
  text = 'Missing Authorization Policy',
  textTooltip = 'This workload is not covered by any authorization policy.',
  tooltip = false,
  icon = icons.istio.missingAuthPolicy.icon,
  color = icons.istio.missingAuthPolicy.color,
  namespace,
  className,
}) => {
  const iconComponent = (
    <span className={className}>
      {React.createElement(icon, { style: { color: color } })}

      {!tooltip && (
        <span style={{ marginLeft: '0.5rem' }}>
          {text}

          <Tooltip
            key="tooltip_missing_auth_policy"
            position={TooltipPosition.top}
            content={<div style={{ textAlign: 'left' }}>{textTooltip}</div>}
          >
            <KialiIcon.Info className={infoStyle} />
          </Tooltip>
        </span>
      )}
    </span>
  );

  if (isIstioNamespace(namespace)) {
    return <></>;
  }

  return tooltip ? (
    <Tooltip
      content={<div style={{ textAlign: 'left' }}>{textTooltip}</div>}
      position={TooltipPosition.right}
    >
      {iconComponent}
    </Tooltip>
  ) : (
    iconComponent
  );
};
