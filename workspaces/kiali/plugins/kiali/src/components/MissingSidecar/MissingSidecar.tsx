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
import { isIstioNamespace, serverConfig } from '../../config/ServerConfig';
import { kialiStyle } from '../../styles/StyleUtils';

type MissingSidecarProps = {
  'data-test'?: string;
  text: string;
  textmesh?: string;
  texttooltip: string;
  tooltip: boolean;
  meshtooltip: string;
  icon: React.ComponentClass<SVGIconProps>;
  color: string;
  namespace: string;
  style?: React.CSSProperties;
  isGateway?: boolean;
};

const infoStyle = kialiStyle({
  margin: '0px 5px 2px 4px',
  verticalAlign: '-5px !important',
});

export class MissingSidecar extends React.Component<MissingSidecarProps, {}> {
  static defaultProps = {
    textmesh: 'Out of mesh',
    text: 'Missing Sidecar',
    meshtooltip:
      'Out of mesh. Istio sidecar container or Ambient labels not found in Pod(s). Check if the istio-injection label/annotation is correctly set on the namespace/workload.',
    texttooltip:
      'Istio sidecar container not found in Pod(s). Check if the istio-injection label/annotation is correctly set on the namespace/workload.',
    tooltip: false,
    icon: icons.istio.missingSidecar.icon,
    color: icons.istio.missingSidecar.color,
  };

  render() {
    const {
      text,
      texttooltip,
      icon,
      namespace,
      color,
      tooltip,
      style,
      ...otherProps
    } = this.props;
    const iconComponent = (
      <span style={style} {...otherProps} data-test={this.props['data-test']}>
        {React.createElement(icon, {
          style: { color: color, verticalAlign: '-2px' },
        })}
        {!tooltip && (
          <span style={{ marginLeft: '8px' }}>
            {serverConfig.ambientEnabled
              ? this.props.textmesh
              : this.props.text}
            <Tooltip
              key="tooltip_missing_sidecar"
              position={TooltipPosition.top}
              content={
                <div style={{ textAlign: 'left' }}>
                  {serverConfig.ambientEnabled
                    ? this.props.meshtooltip
                    : this.props.texttooltip}
                </div>
              }
            >
              <KialiIcon.Info className={infoStyle} />
            </Tooltip>
          </span>
        )}
      </span>
    );

    if (isIstioNamespace(namespace) || this.props.isGateway) {
      return <></>;
    }

    return tooltip ? (
      <Tooltip
        content={
          <div style={{ textAlign: 'left' }}>
            {serverConfig.ambientEnabled
              ? this.props.meshtooltip
              : this.props.texttooltip}
          </div>
        }
        position={TooltipPosition.right}
      >
        {iconComponent}
      </Tooltip>
    ) : (
      iconComponent
    );
  }
}
