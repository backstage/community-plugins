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
import Button from '@material-ui/core/Button';
import { default as React } from 'react';
import { KialiIcon } from '../../config/KialiIcon';
import { kialiStyle } from '../../styles/StyleUtils';
import { Label } from './Label';

const SHOW_MORE_TRESHOLD = 2;

interface LabelsProps {
  expanded?: boolean;
  type?: string;
  labels?: { [key: string]: string };
  tooltipMessage?: string;
}

const linkStyle = kialiStyle({
  padding: '0 0.25rem',
  fontSize: '0.8rem',
});

const infoStyle = kialiStyle({
  marginLeft: '0.25rem',
  marginBottom: '0.125rem',
});

const labelsContainerStyle = kialiStyle({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  overflow: 'hidden',
});

export const Labels: React.FC<LabelsProps> = (props: LabelsProps) => {
  const [expanded, setExpanded] = React.useState<boolean>(
    props.expanded ?? false,
  );

  const labelKeys = Object.keys(props.labels ?? {});

  const hasLabels = labelKeys.length > 0;

  const hasManyLabels = labelKeys.length > SHOW_MORE_TRESHOLD;

  const showItem = (i: number): boolean => {
    return expanded || !hasManyLabels || i < SHOW_MORE_TRESHOLD;
  };

  const renderMoreLabelsLink: React.ReactNode | null =
    hasManyLabels && !expanded ? (
      <Button
        variant="contained"
        className={linkStyle}
        onClick={() => setExpanded(true)}
      >
        More {props.type ? props.type : 'labels'}...
      </Button>
    ) : null;

  const renderLabels = labelKeys.map((key, i) => {
    return showItem(i) ? (
      <div key={`label_div_${i}`} data-test={`${key}-label-container`}>
        <Label
          key={key}
          name={key}
          value={props.labels ? props.labels[key] : ''}
        />
      </div>
    ) : undefined;
  });

  const renderEmptyLabels = (
    <span> No {props.type ? props.type : 'labels'} </span>
  );

  const tooltip = props.tooltipMessage ? (
    <Tooltip
      placement="right"
      title={<div style={{ textAlign: 'left' }}>{props.tooltipMessage}</div>}
    >
      <div data-test="help-icon">
        <KialiIcon.Info className={infoStyle} />
      </div>
    </Tooltip>
  ) : undefined;

  return (
    <div className={labelsContainerStyle}>
      {hasLabels ? [renderLabels, renderMoreLabelsLink] : renderEmptyLabels}
      {tooltip}
    </div>
  );
};
