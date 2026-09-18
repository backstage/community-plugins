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
import { Chip, Tooltip } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { default as React } from 'react';
import { getChipStyle } from '../../styles/StyleUtils';

type AmbientLabelProps = {
  tooltip: boolean;
  style?: React.CSSProperties;
  waypoint?: boolean;
};

const AmbientComponent = 'ztunnel';

export const AmbientLabel = (props: AmbientLabelProps) => {
  const theme = useTheme();
  const chipStyle = getChipStyle(theme);
  const msg = 'Component is labeled as part of the Istio Ambient Mesh';

  const tooltipContent = (
    <div style={{ textAlign: 'left' }}>
      <div>
        {msg}
        <br />
      </div>
    </div>
  );
  const iconComponent = (
    <span style={props.style}>
      <Chip style={chipStyle} size="small" label={AmbientComponent} />
      {props.waypoint && (
        <Chip style={chipStyle} size="small" label="Waypoint" />
      )}
      {!props.tooltip && (
        <span style={{ marginLeft: '8px' }}>
          {msg}
          <Tooltip
            key="tooltip_ambient_label"
            placement="top"
            title={tooltipContent}
          >
            <Chip style={chipStyle} size="small" label={AmbientComponent} />
          </Tooltip>
        </span>
      )}
    </span>
  );
  return props.tooltip ? (
    <Tooltip
      key="tooltip_ambient_label"
      placement="right"
      title={tooltipContent}
    >
      <span>{iconComponent}</span>
    </Tooltip>
  ) : (
    iconComponent
  );
};
