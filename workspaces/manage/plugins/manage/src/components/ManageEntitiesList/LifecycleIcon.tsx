/*
 * Copyright 2026 The Backstage Authors
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

import type { CSSProperties } from 'react';

import type { Entity } from '@backstage/catalog-model';

import Tooltip from '@mui/material/Tooltip';
import BusinessIcon from '@mui/icons-material/Business';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const lifecycleIcon: CSSProperties = {
  fontSize: 'inherit',
  verticalAlign: 'middle',
  marginRight: 'var(--bui-space-1)',
};

export function LifecycleIcon(props: { entity: Entity }) {
  const lifecycle = props.entity.spec?.lifecycle ?? '';

  if (lifecycle === 'production') {
    return (
      <Tooltip title="Production">
        <BusinessIcon style={lifecycleIcon} />
      </Tooltip>
    );
  } else if (lifecycle === 'experimental') {
    return (
      <Tooltip title="Experimental">
        <ScatterPlotIcon style={lifecycleIcon} />
      </Tooltip>
    );
  } else if (lifecycle === 'deprecated') {
    return (
      <Tooltip title="Deprecated">
        <DeleteOutlineIcon style={lifecycleIcon} />
      </Tooltip>
    );
  }

  return <></>;
}
