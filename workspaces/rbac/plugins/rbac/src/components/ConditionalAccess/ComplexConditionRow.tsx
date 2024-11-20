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
import React from 'react';

import { PermissionCondition } from '@backstage/plugin-permission-common';

import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';

import {
  getNestedRuleErrors,
  getRowKey,
  getRowStyle,
  getSimpleRuleErrors,
  isSimpleRule,
} from '../../utils/conditional-access-utils';
import { ConditionsFormRowFields } from './ConditionsFormRowFields';
import { criterias } from './const';
import {
  AccessConditionsErrors,
  ComplexErrors,
  Condition,
  ConditionsData,
  NestedCriteriaErrors,
  NotConditionType,
  RulesData,
} from './types';

type ComplexConditionRowProps = {
  conditionRow: ConditionsData;
  nestedConditionRow: Condition[];
  criteria: keyof ConditionsData;
  onRuleChange: (newCondition: ConditionsData) => void;
  updateRules: (updatedNestedConditionRow: Condition[] | Condition) => void;
  setErrors: React.Dispatch<
    React.SetStateAction<AccessConditionsErrors | undefined>
  >;
  setRemoveAllClicked: React.Dispatch<React.SetStateAction<boolean>>;
  conditionRulesData?: RulesData;
  notConditionType?: NotConditionType;
  currentCondition: Condition;
  ruleIndex: number;
  activeCriteria?: 'allOf' | 'anyOf';
  isNestedCondition?: boolean;
  nestedConditionIndex?: number;
  activeNestedCriteria?: 'allOf' | 'anyOf';
};

export const ComplexConditionRow = ({
  conditionRow,
  nestedConditionRow,
  criteria,
  onRuleChange,
  updateRules,
  setErrors,
  setRemoveAllClicked,
  conditionRulesData,
  notConditionType,
  currentCondition,
  ruleIndex,
  activeCriteria,
  isNestedCondition = false,
  nestedConditionIndex,
  activeNestedCriteria,
}: ComplexConditionRowProps) => {
  const handleRemoveSimpleConditionRule = (
    index: number,
    ruleList: PermissionCondition[],
  ) => {
    if (!activeCriteria) {
      return;
    }
    const updatedSimpleRules = ruleList.filter(
      (_r, rindex) => index !== rindex,
    );
    const nestedConditions =
      (conditionRow[criteria] as PermissionCondition[])?.filter(
        (con: PermissionCondition) =>
          criterias.allOf in con ||
          criterias.anyOf in con ||
          criterias.not in con,
      ) || [];

    onRuleChange({
      [activeCriteria as keyof ConditionsData]: [
        ...updatedSimpleRules,
        ...nestedConditions,
      ],
    });

    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors[activeCriteria]) {
        const criteriaErrors = updatedErrors[activeCriteria] as ComplexErrors[];
        const simpleRuleErrors = getSimpleRuleErrors(criteriaErrors);

        if (Array.isArray(simpleRuleErrors) && simpleRuleErrors.length > 0) {
          const updatedCriteriaErrors = [
            ...simpleRuleErrors.filter((_, rindex) => rindex !== index),
            ...getNestedRuleErrors(criteriaErrors),
          ];

          updatedErrors[activeCriteria] =
            updatedCriteriaErrors.length > 0 ? updatedCriteriaErrors : [];
        } else {
          delete updatedErrors[activeCriteria];
        }
      }

      return updatedErrors;
    });
  };

  const handleRemoveNestedConditionRule = (nestedConditionCriteria: string) => {
    const updatedNestedConditionRow: Condition[] = [];

    nestedConditionRow.forEach((c, index) => {
      if (index === nestedConditionIndex) {
        const updatedRules = (
          (c[
            nestedConditionCriteria as keyof Condition
          ] as PermissionCondition[]) || []
        ).filter((_r, rindex) => rindex !== ruleIndex);
        updatedNestedConditionRow.push({
          [nestedConditionCriteria as keyof Condition]: updatedRules,
        });
      } else {
        updatedNestedConditionRow.push(c);
      }
    });

    updateRules(
      criteria === criterias.not
        ? updatedNestedConditionRow[0]
        : updatedNestedConditionRow,
    );

    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors[criteria] !== undefined) {
        const criteriaErrors = updatedErrors[criteria] as ComplexErrors[];

        if (
          criteria === criterias.not &&
          notConditionType === 'nested-condition'
        ) {
          (
            (updatedErrors[criteria] as NestedCriteriaErrors)[
              nestedConditionCriteria
            ] as string[]
          ).splice(ruleIndex, 1);
          return updatedErrors;
        }

        const nestedConditionErrors = getNestedRuleErrors(criteriaErrors);

        if (
          Array.isArray(nestedConditionErrors) &&
          nestedConditionIndex !== undefined
        ) {
          const nestedErrors = nestedConditionErrors[nestedConditionIndex];
          if (nestedErrors[nestedConditionCriteria]) {
            const updatedNestedErrors = (
              nestedErrors[nestedConditionCriteria] as string[]
            ).filter((_error, index) => index !== ruleIndex);

            if (updatedNestedErrors.length > 0) {
              nestedErrors[nestedConditionCriteria] = updatedNestedErrors;
            } else {
              delete nestedErrors[nestedConditionCriteria];
            }

            nestedConditionErrors[nestedConditionIndex] = nestedErrors;
          }

          updatedErrors[criteria] = [
            ...getSimpleRuleErrors(criteriaErrors),
            ...nestedConditionErrors,
          ];
        }
      }

      return updatedErrors;
    });
  };

  const ruleList = isNestedCondition
    ? (currentCondition[
        activeCriteria as keyof Condition
      ] as PermissionCondition[])
    : ((conditionRow[activeCriteria as keyof Condition] as Condition[]).filter(
        r => isSimpleRule(r),
      ) as PermissionCondition[]);

  const disabled =
    !isNestedCondition &&
    (conditionRow[criteria as keyof Condition] as Condition[]).length === 1 &&
    nestedConditionRow.length === 0 &&
    ruleIndex === 0;
  const nestedDisabled =
    isNestedCondition &&
    (
      nestedConditionRow[nestedConditionIndex ?? 0][
        activeNestedCriteria as keyof Condition
      ] as Condition[]
    ).length === 1 &&
    ruleIndex === 0;

  return (
    (currentCondition as PermissionCondition).resourceType && (
      <div
        style={getRowStyle(currentCondition, isNestedCondition)}
        key={getRowKey(isNestedCondition, ruleIndex)}
      >
        <ConditionsFormRowFields
          oldCondition={currentCondition}
          index={isNestedCondition ? undefined : ruleIndex}
          onRuleChange={onRuleChange}
          conditionRow={conditionRow}
          criteria={criteria}
          conditionRulesData={conditionRulesData}
          setErrors={setErrors}
          setRemoveAllClicked={setRemoveAllClicked}
          nestedConditionRow={
            isNestedCondition ? nestedConditionRow : undefined
          }
          nestedConditionCriteria={
            isNestedCondition ? activeNestedCriteria : undefined
          }
          nestedConditionIndex={
            isNestedCondition ? nestedConditionIndex : undefined
          }
          nestedConditionRuleIndex={isNestedCondition ? ruleIndex : undefined}
          updateRules={isNestedCondition ? updateRules : undefined}
        />
        <IconButton
          title="Remove"
          sx={{
            color: theme => theme.palette.grey[500],
            flexGrow: 0,
            alignSelf: 'baseline',
            marginTop: theme => theme.spacing(3.3),
          }}
          disabled={isNestedCondition ? nestedDisabled : disabled}
          onClick={
            isNestedCondition &&
            activeNestedCriteria &&
            nestedConditionIndex !== undefined
              ? () => handleRemoveNestedConditionRule(activeNestedCriteria)
              : () => {
                  handleRemoveSimpleConditionRule(ruleIndex, ruleList);
                }
          }
        >
          <RemoveIcon />
        </IconButton>
      </div>
    )
  );
};
