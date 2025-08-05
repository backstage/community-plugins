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
import {
  StatusCondition,
  ValidationTypes,
} from '@backstage-community/plugin-kiali-common/types';
import { Tooltip, Typography } from '@material-ui/core';
import { CSSProperties } from 'react';
import { kialiStyle } from '../../styles/StyleUtils';
import { Validation } from './Validation';

interface Props {
  id: string;
  reconciledCondition?: StatusCondition;
  errors: number;
  warnings: number;
  objectCount?: number;
  style?: CSSProperties;
  type?: string;
}

const tooltipListStyle = kialiStyle({
  textAlign: 'left',
  border: 0,
  padding: '0 0 0 0',
  margin: '0 0 0 0',
});

const tooltipSentenceStyle = kialiStyle({
  textAlign: 'center',
  border: 0,
  padding: '0 0 0 0',
  margin: '0 0 0 0',
});

export const ValidationSummary = (props: Props) => {
  const getTypeMessage = (count: number, type: ValidationTypes): string => {
    return count > 1 ? `${count} ${type}s found` : `${count} ${type} found`;
  };

  const severitySummary = () => {
    const issuesMessages: string[] = [];

    if (props.errors > 0) {
      issuesMessages.push(getTypeMessage(props.errors, ValidationTypes.Error));
    }

    if (props.warnings > 0) {
      issuesMessages.push(
        getTypeMessage(props.warnings, ValidationTypes.Warning),
      );
    }

    if (issuesMessages.length === 0) {
      issuesMessages.push('No issues found');
    }

    return issuesMessages;
  };

  const severity = () => {
    if (props.errors > 0) {
      return ValidationTypes.Error;
    } else if (props.warnings > 0) {
      return ValidationTypes.Warning;
    }
    return ValidationTypes.Correct;
  };

  const tooltipNA = () => {
    return (
      <Typography variant="body2" className={tooltipSentenceStyle}>
        No Istio config objects found
      </Typography>
    );
  };

  const tooltipNoValidationAvailable = () => {
    return (
      <Typography variant="body2" className={tooltipListStyle}>
        No Istio config validation available
      </Typography>
    );
  };

  const tooltipSummary = () => {
    return (
      <>
        <Typography
          variant="body2"
          style={{ textAlign: 'left', textEmphasis: 'strong' }}
        >
          Istio config objects analyzed: {props.objectCount}
        </Typography>
        <div className={tooltipListStyle}>
          {severitySummary().map(cat => (
            <div key={cat}>{cat}</div>
          ))}
        </div>
        {props.reconciledCondition?.status && (
          <Typography
            variant="body2"
            style={{ textAlign: 'left', textEmphasis: 'strong' }}
          >
            The object is reconciled
          </Typography>
        )}
      </>
    );
  };

  const tooltipContent = () => {
    if (props.objectCount !== undefined) {
      if (props.objectCount === 0) {
        return tooltipNA();
      }
      return tooltipSummary();
    }
    return tooltipNoValidationAvailable();
  };

  const tooltipBase = () => {
    return props.objectCount === undefined || props.objectCount > 0 ? (
      <Validation iconStyle={props.style} severity={severity()} />
    ) : (
      <div style={{ display: 'inline-block', marginLeft: '5px' }}>N/A</div>
    );
  };

  return (
    <Tooltip
      aria-label="Validations list"
      data-test={`validation-icon-${severity()}`}
      placement="right"
      title={tooltipContent()}
    >
      <span>{tooltipBase()}</span>
    </Tooltip>
  );
};
