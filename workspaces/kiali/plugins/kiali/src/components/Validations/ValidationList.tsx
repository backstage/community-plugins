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
import React from 'react';
import { ObjectCheck, ValidationTypes } from '../../types/IstioObjects';
import { highestSeverity } from '../../types/ServiceInfo';
import { Validation } from './Validation';

type ValidationListProps = {
  checks?: ObjectCheck[];
  tooltipPosition?: string;
};

export const ValidationList: React.FC<ValidationListProps> = (
  props: ValidationListProps,
) => {
  const content = (props.checks ?? []).map((check, index) => {
    return (
      <Validation
        key={`validation-check-${index}`}
        severity={check.severity}
        message={`${check.code ? `${check.code} ` : ''}${check.message}`}
      />
    );
  });

  const severity = highestSeverity(props.checks ?? []);
  const isValid = severity === ValidationTypes.Correct;

  const tooltip = (
    <Tooltip title={isValid ? 'Valid' : content}>
      <span>
        <Validation severity={severity} />
      </span>
    </Tooltip>
  );

  return tooltip;
};
