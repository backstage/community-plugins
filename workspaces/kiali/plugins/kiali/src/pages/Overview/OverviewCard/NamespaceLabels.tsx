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
import { Tooltip } from '@material-ui/core';
import { KialiIcon } from '../../../config';
import { kialiStyle } from '../../../styles/StyleUtils';

const infoIconStyle = kialiStyle({
  margin: '0px 0px -1px 4px',
});

type NamespaceLabelsprops = {
  labels?: { [key: string]: string };
};
export const NamespaceLabels = (props: NamespaceLabelsprops) => {
  const labelsLength = props.labels
    ? `${Object.entries(props.labels).length}`
    : 'No';
  const tooltipTitle = (
    <ul data-test="namespace-labels">
      {Object.entries(props.labels || []).map(([key, value]) => (
        <li key={key}>
          {key}={value}
        </li>
      ))}
    </ul>
  );
  return props.labels ? (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
      }}
    >
      <span id="labels_info">
        {labelsLength} label{labelsLength !== '1' ? 's' : ''}
      </span>
      <Tooltip title={tooltipTitle} placement="right">
        <span data-test="labels-info-icon" style={{ display: 'inline-flex' }}>
          <KialiIcon.Info className={infoIconStyle} />
        </span>
      </Tooltip>
    </span>
  ) : (
    <div style={{ textAlign: 'left' }}>No labels</div>
  );
};
