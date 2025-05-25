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
  ObjectValidation,
  ValidationTypes,
} from '@backstage-community/plugin-kiali-common/types';
import { default as React } from 'react';
import { ValidationSummary } from './ValidationSummary';

interface Props {
  id: string;
  validations: ObjectValidation[];
}

export const ValidationServiceSummary: React.FC<Props> = (props: Props) => {
  const numberOfChecks = (type: ValidationTypes): number => {
    let numCheck = 0;

    props.validations.forEach(validation => {
      if (validation.checks) {
        numCheck += validation.checks.filter(i => i.severity === type).length;
      }
    });

    return numCheck;
  };

  return (
    <ValidationSummary
      id={props.id}
      errors={numberOfChecks(ValidationTypes.Error)}
      warnings={numberOfChecks(ValidationTypes.Warning)}
      type="service"
    />
  );
};
