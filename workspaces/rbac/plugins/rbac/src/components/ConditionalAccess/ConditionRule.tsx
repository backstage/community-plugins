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
import type { SetStateAction, Dispatch } from 'react';

import {
  getDefaultRule,
  ruleOptionDisabled,
} from '../../utils/conditional-access-utils';
import { ConditionsFormRowFields } from './ConditionsFormRowFields';
import { criterias } from './const';
import { AccessConditionsErrors, ConditionsData, RulesData } from './types';

type ConditionRuleProps = {
  conditionRow: ConditionsData;
  selPluginResourceType: string;
  onRuleChange: (newCondition: ConditionsData) => void;
  criteria: string;
  conditionRulesData?: RulesData;
  setErrors: Dispatch<SetStateAction<AccessConditionsErrors | undefined>>;
  setRemoveAllClicked: Dispatch<SetStateAction<boolean>>;
};

export const ConditionRule = ({
  conditionRow,
  selPluginResourceType,
  onRuleChange,
  criteria,
  conditionRulesData,
  setErrors,
  setRemoveAllClicked,
}: ConditionRuleProps) => {
  return (
    criteria === criterias.condition && (
      <ConditionsFormRowFields
        oldCondition={
          conditionRow.condition ?? getDefaultRule(selPluginResourceType)
        }
        onRuleChange={onRuleChange}
        conditionRow={conditionRow}
        criteria={criteria}
        conditionRulesData={conditionRulesData}
        setErrors={setErrors}
        optionDisabled={ruleOption =>
          ruleOptionDisabled(
            ruleOption,
            conditionRow.condition ? [conditionRow.condition] : undefined,
          )
        }
        setRemoveAllClicked={setRemoveAllClicked}
      />
    )
  );
};
