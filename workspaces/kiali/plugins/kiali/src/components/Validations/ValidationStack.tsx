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
import { highestSeverity } from '@backstage-community/plugin-kiali-common/func';
import {
  ObjectCheck,
  ValidationTypes,
} from '@backstage-community/plugin-kiali-common/types';
import { default as React } from 'react';
import { kialiStyle } from '../../styles/StyleUtils';
import { PFColors } from '../Pf/PfColors';
import { Validation } from './Validation';

type ValidationStackProps = {
  checks?: ObjectCheck[];
};

const colorStyle = kialiStyle({ color: PFColors.White });
const titleStyle = kialiStyle({ color: PFColors.White, fontWeight: 'bold' });

export const ValidationStack: React.FC<ValidationStackProps> = (
  props: ValidationStackProps,
) => {
  const validationList = (): React.ReactNode[] => {
    return (props.checks ?? []).map((check, index) => {
      return (
        <div className={colorStyle}>
          <Validation
            key={`validation-check-${index}`}
            severity={check.severity}
            message={`${check.code ? `${check.code} ` : ''}${check.message}`}
          />
        </div>
      );
    });
  };

  const severity = highestSeverity(props.checks ?? []);
  const isValid = severity === ValidationTypes.Correct;

  if (!isValid) {
    return (
      <div>
        <span className={titleStyle}>Istio validations</span>
        {validationList()}
      </div>
    );
  }
  return null;
};
