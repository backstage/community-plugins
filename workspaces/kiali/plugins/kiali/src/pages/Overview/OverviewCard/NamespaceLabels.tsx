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
import { infoStyle } from './CanaryUpgradeProgress';

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
    <>
      <div id="labels_info" style={{ display: 'inline' }}>
        {labelsLength} label{labelsLength !== '1' ? 's' : ''}
      </div>
      <Tooltip title={tooltipTitle} placement="right">
        <span data-test="labels-info-icon">
          <KialiIcon.Info className={infoStyle} />
        </span>
      </Tooltip>
    </>
  ) : (
    <div style={{ textAlign: 'left' }}>No labels</div>
  );
};
