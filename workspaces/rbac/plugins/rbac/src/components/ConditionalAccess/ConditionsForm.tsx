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

import WarningIcon from '@mui/icons-material/Warning';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import {
  hasAllOfOrAnyOfErrors,
  hasNestedNotErrors,
  hasSimpleConditionOrNotErrors,
  initializeErrors,
  isSimpleRule,
  resetErrors,
} from '../../utils/conditional-access-utils';
import { ConditionsFormRow } from './ConditionsFormRow';
import { criterias } from './const';
import {
  AccessConditionsErrors,
  Condition,
  ConditionsData,
  RulesData,
} from './types';

type ConditionFormProps = {
  conditionRulesData?: RulesData;
  conditionsFormVal?: ConditionsData;
  selPluginResourceType: string;
  onClose: () => void;
  onSave: (conditions?: ConditionsData) => void;
};

export const ConditionsForm = ({
  conditionRulesData,
  selPluginResourceType,
  conditionsFormVal,
  onClose,
  onSave,
}: ConditionFormProps) => {
  const [conditions, setConditions] = React.useState<ConditionsData>(
    conditionsFormVal ?? {
      condition: {
        rule: '',
        resourceType: selPluginResourceType,
        params: {},
      },
    },
  );
  const [criteria, setCriteria] = React.useState<keyof ConditionsData>(
    (Object.keys(conditions)[0] as keyof ConditionsData) ?? criterias.condition,
  );
  const [errors, setErrors] = React.useState<
    AccessConditionsErrors | undefined
  >(initializeErrors(criteria, conditions));

  const [removeAllClicked, setRemoveAllClicked] =
    React.useState<boolean>(false);

  const flattenConditions = (
    conditionData: Condition[],
  ): PermissionCondition[] => {
    const flatConditions: PermissionCondition[] = [];

    const processCondition = (condition: Condition) => {
      if ('rule' in condition) {
        flatConditions.push(condition);
      } else {
        if (condition.allOf) {
          condition.allOf.forEach(processCondition);
        }
        if (condition.anyOf) {
          condition.anyOf.forEach(processCondition);
        }
        if (condition.not) {
          if ('rule' in condition.not) {
            flatConditions.push(condition.not);
          } else {
            processCondition(condition.not);
          }
        }
      }
    };
    conditionData.forEach(processCondition);
    return flatConditions;
  };

  const isNoRuleSelected = () => {
    switch (criteria) {
      case criterias.condition:
        return !conditions.condition?.rule;
      case criterias.not: {
        const flatConditions = flattenConditions([
          conditions.not as PermissionCondition,
        ]);
        return flatConditions.some(c => !c.rule);
      }
      case criterias.allOf: {
        const flatConditions = flattenConditions(conditions.allOf || []);
        return flatConditions.some(c => !c.rule);
      }
      case criterias.anyOf: {
        const flatConditions = flattenConditions(conditions.anyOf || []);
        return flatConditions.some(c => !c.rule);
      }
      default:
        return true;
    }
  };

  const hasAnyErrors = (): boolean => {
    if (!errors) return false;

    if (
      criteria === criterias.condition ||
      (criteria === criterias.not &&
        isSimpleRule(conditions[criteria] as Condition))
    ) {
      return hasSimpleConditionOrNotErrors(errors, criteria);
    }

    if (
      criteria === criterias.not &&
      !isSimpleRule(conditions[criteria] as Condition)
    ) {
      return hasNestedNotErrors(errors, conditions, criteria);
    }

    if (criteria === criterias.allOf || criteria === criterias.anyOf) {
      return hasAllOfOrAnyOfErrors(errors, criteria);
    }

    return false;
  };

  const isSaveDisabled = () => {
    if (removeAllClicked) return false;

    return (
      hasAnyErrors() ||
      isNoRuleSelected() ||
      Object.is(conditionsFormVal, conditions)
    );
  };

  const hasMultiLevelNestedConditions = (): boolean => {
    if (!Array.isArray(conditions[criteria])) {
      return false;
    }

    return (conditions[criteria] as Condition[])
      .filter(condition => !('rule' in condition))
      .some((firstLevelNestedCondition: Condition) => {
        const nestedConditionCriteria = Object.keys(
          firstLevelNestedCondition,
        )[0];
        if (
          Array.isArray(
            firstLevelNestedCondition[
              nestedConditionCriteria as keyof Condition
            ],
          )
        ) {
          return (
            firstLevelNestedCondition[
              nestedConditionCriteria as keyof Condition
            ] as Condition[]
          ).some((con: Condition) => !('rule' in con));
        }

        return !Object.keys(
          firstLevelNestedCondition[
            nestedConditionCriteria as keyof Condition
          ] as Condition[],
        ).includes('rule');
      });
  };

  return (
    <>
      <Box
        sx={{
          padding: theme => theme.spacing(2.5),
          paddingTop: 0,
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        <ConditionsFormRow
          conditionRulesData={conditionRulesData}
          conditionRow={conditions}
          criteria={criteria}
          selPluginResourceType={selPluginResourceType}
          onRuleChange={newCondition => setConditions(newCondition)}
          setCriteria={setCriteria}
          setErrors={setErrors}
          setRemoveAllClicked={setRemoveAllClicked}
        />
        {hasMultiLevelNestedConditions() && (
          <Alert
            icon={<WarningIcon />}
            style={{ margin: '1.5rem 0 1rem 0' }}
            severity="warning"
            data-testid="multi-level-nested-conditions-warning"
          >
            <AlertTitle data-testid="multi-level-nested-conditions-warning-title">
              Multiple levels of nested conditions are not supported
            </AlertTitle>
            Only one level is displayed. Please use the CLI to view all nested
            conditions.
          </Alert>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '15px',
          alignItems: 'baseline',
          borderTop: theme => `2px solid ${theme.palette.border}`,
          padding: theme => theme.spacing(2.5),
          '& button': {
            textTransform: 'none',
          },
        }}
      >
        <Button
          variant="contained"
          color="primary"
          data-testid="save-conditions"
          disabled={isSaveDisabled()}
          onClick={() => {
            if (removeAllClicked) {
              onSave(undefined);
            } else onSave(conditions);
          }}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          data-testid="cancel-conditions"
        >
          Cancel
        </Button>
        <Button
          variant="text"
          color="primary"
          disabled={removeAllClicked || isNoRuleSelected()}
          onClick={() => {
            setRemoveAllClicked(true);
            setCriteria(criterias.condition);
            setConditions({
              condition: {
                rule: '',
                resourceType: selPluginResourceType,
                params: {},
              },
            });
            setErrors(resetErrors(criterias.condition));
          }}
          data-testid="remove-conditions"
        >
          Remove all
        </Button>
      </Box>
    </>
  );
};
