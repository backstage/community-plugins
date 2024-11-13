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

import { Box, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import Form from '@rjsf/mui';
import {
  RegistryFieldsType,
  RJSFSchema,
  RJSFValidationError,
  UiSchema,
} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import {
  getNestedRuleErrors,
  getSimpleRuleErrors,
  isSimpleRule,
  makeConditionsFormRowFieldsStyles,
  setErrorMessage,
} from '../../utils/conditional-access-utils';
import { criterias } from './const';
import { CustomArrayField } from './CustomArrayField';
import { RulesDropdownOption } from './RulesDropdownOption';
import {
  AccessConditionsErrors,
  ComplexErrors,
  Condition,
  ConditionsData,
  NestedCriteriaErrors,
  RulesData,
} from './types';

type ConditionFormRowFieldsProps = {
  oldCondition: Condition;
  index?: number;
  criteria: string;
  onRuleChange: (newCondition: ConditionsData) => void;
  conditionRow: ConditionsData | Condition;
  conditionRulesData?: RulesData;
  setErrors: React.Dispatch<
    React.SetStateAction<AccessConditionsErrors | undefined>
  >;
  optionDisabled?: (ruleOption: string) => boolean;
  setRemoveAllClicked: React.Dispatch<React.SetStateAction<boolean>>;
  nestedConditionRow?: Condition[];
  nestedConditionCriteria?: string;
  nestedConditionIndex?: number;
  nestedConditionRuleIndex?: number;
  updateRules?: (newCondition: Condition[] | Condition) => void;
};

export const ConditionsFormRowFields = ({
  oldCondition,
  index,
  criteria,
  onRuleChange,
  conditionRow,
  conditionRulesData,
  setErrors,
  optionDisabled,
  setRemoveAllClicked,
  nestedConditionRow,
  nestedConditionCriteria,
  nestedConditionIndex,
  nestedConditionRuleIndex,
  updateRules,
}: ConditionFormRowFieldsProps) => {
  const classes = makeConditionsFormRowFieldsStyles({
    isNotSimpleCondition:
      criteria === criterias.not && !nestedConditionCriteria,
  });
  const rules = conditionRulesData?.rules ?? [];
  const paramsSchema =
    conditionRulesData?.[(oldCondition as PermissionCondition).rule]?.schema;

  const schema: RJSFSchema = paramsSchema;

  const uiSchema: UiSchema = {
    'ui:submitButtonOptions': {
      norender: true,
    },
    'ui:classNames': `${classes.params}`,
    'ui:field': 'array',
  };

  const customFields: RegistryFieldsType = { ArrayField: CustomArrayField };

  const handleConditionChange = (newCondition: PermissionCondition) => {
    setRemoveAllClicked(false);
    switch (criteria) {
      case criterias.condition: {
        onRuleChange({ condition: newCondition });
        break;
      }
      case criterias.allOf: {
        const updatedCriteria = (conditionRow as ConditionsData).allOf ?? [];
        updatedCriteria[index ?? 0] = newCondition;
        onRuleChange({ allOf: updatedCriteria });
        break;
      }
      case criterias.anyOf: {
        const updatedCriteria = (conditionRow as ConditionsData).anyOf ?? [];
        updatedCriteria[index ?? 0] = newCondition;
        onRuleChange({ anyOf: updatedCriteria });
        break;
      }
      case criterias.not: {
        onRuleChange({ not: newCondition });
        break;
      }
      default:
    }
  };

  const handleNestedConditionChange = (newCondition: PermissionCondition) => {
    if (
      !nestedConditionRow ||
      !nestedConditionCriteria ||
      nestedConditionIndex === undefined ||
      !updateRules
    ) {
      return;
    }
    const updatedNestedConditionRow: Condition[] = nestedConditionRow.map(
      (c, i) => {
        if (i === nestedConditionIndex) {
          if (nestedConditionCriteria === criterias.not) {
            return {
              [nestedConditionCriteria]: newCondition,
            };
          }
          const updatedNestedConditionRules = (
            (c[
              nestedConditionCriteria as keyof Condition
            ] as PermissionCondition[]) || []
          ).map((rule, rindex) => {
            return rindex === nestedConditionRuleIndex ? newCondition : rule;
          });

          return {
            [nestedConditionCriteria]: updatedNestedConditionRules,
          };
        }
        return c;
      },
    );

    updateRules(
      criteria === criterias.not
        ? updatedNestedConditionRow[0]
        : updatedNestedConditionRow,
    );
  };

  const handleTransformErrors = (errors: RJSFValidationError[]) => {
    // criteria: condition or not simple-condition
    if (
      criteria === criterias.condition ||
      (criteria === criterias.not &&
        isSimpleRule(conditionRow[criteria as keyof Condition]))
    ) {
      setErrors(prevErrors => {
        const updatedErrors = { ...prevErrors };
        updatedErrors[criteria] = setErrorMessage(errors);

        return updatedErrors;
      });
    }

    // criteria: not nested-condition
    if (
      criteria === criterias.not &&
      nestedConditionCriteria &&
      !isSimpleRule(conditionRow[criteria as keyof Condition])
    ) {
      setErrors(prevErrors => {
        const updatedErrors = { ...prevErrors };
        const nestedErrors = (updatedErrors[criteria] as ComplexErrors)[
          nestedConditionCriteria as keyof Condition
        ] as NestedCriteriaErrors;

        // nestedCriteria: allOf or anyOf
        if (
          Array.isArray(nestedErrors) &&
          nestedConditionRuleIndex !== undefined
        ) {
          nestedErrors[nestedConditionRuleIndex] = setErrorMessage(errors);
        } else {
          // nestedCriteria: not
          updatedErrors[criteria] = {
            [nestedConditionCriteria]: setErrorMessage(errors),
          };
        }

        return updatedErrors;
      });
    }

    // criteria: allOf or anyOf
    if (criteria === criterias.allOf || criteria === criterias.anyOf) {
      setErrors(prevErrors => {
        const updatedErrors = { ...prevErrors };
        const simpleRuleErrors = getSimpleRuleErrors(
          updatedErrors[
            criteria as keyof AccessConditionsErrors
          ] as ComplexErrors[],
        );
        if (
          Array.isArray(simpleRuleErrors) &&
          simpleRuleErrors.length > 0 &&
          index !== undefined
        ) {
          simpleRuleErrors[index] = setErrorMessage(errors);
        }

        const nestedRuleErrors = getNestedRuleErrors(
          updatedErrors[
            criteria as keyof AccessConditionsErrors
          ] as ComplexErrors[],
        );

        // nestedCriteria: allOf or anyOf
        if (
          nestedConditionCriteria &&
          nestedConditionIndex !== undefined &&
          nestedConditionRuleIndex !== undefined
        ) {
          const nestedConditionRuleList =
            nestedRuleErrors[nestedConditionIndex][nestedConditionCriteria];

          if (Array.isArray(nestedConditionRuleList)) {
            nestedConditionRuleList[nestedConditionRuleIndex] =
              setErrorMessage(errors);
          }
        }

        // nestedCriteria: not
        if (
          Array.isArray(nestedRuleErrors) &&
          nestedRuleErrors.length > 0 &&
          nestedConditionCriteria === criterias.not &&
          nestedConditionIndex !== undefined
        ) {
          nestedRuleErrors[nestedConditionIndex][nestedConditionCriteria] =
            setErrorMessage(errors);
        }

        updatedErrors[criteria] = [...simpleRuleErrors, ...nestedRuleErrors];
        return updatedErrors;
      });
    }

    return errors;
  };

  const onConditionChange = (newCondition: PermissionCondition) => {
    if (nestedConditionRow) {
      handleNestedConditionChange(newCondition);
    } else {
      handleConditionChange(newCondition);
    }
  };

  return (
    <Box className={classes.inputFieldContainer}>
      <Autocomplete
        style={{ width: '50%', marginTop: '26px' }}
        className={classes.params}
        options={rules ?? []}
        value={(oldCondition as PermissionCondition)?.rule || null}
        getOptionDisabled={option =>
          optionDisabled ? optionDisabled(option) : false
        }
        onChange={(_event, ruleVal?: string | null) =>
          onConditionChange({
            ...oldCondition,
            rule: ruleVal ?? '',
            params: {},
          } as PermissionCondition)
        }
        renderOption={option => (
          <RulesDropdownOption
            label={option ?? ''}
            rulesData={conditionRulesData}
          />
        )}
        renderInput={(params: any) => (
          <TextField
            {...params}
            label="Rule"
            variant="outlined"
            placeholder="Select a rule"
            required
          />
        )}
      />
      <Box style={{ width: '50%' }}>
        {schema ? (
          <Form
            schema={paramsSchema}
            formData={(oldCondition as PermissionCondition)?.params || {}}
            validator={validator}
            uiSchema={uiSchema}
            fields={customFields}
            onChange={data =>
              onConditionChange({
                ...oldCondition,
                params: data.formData || {},
              } as PermissionCondition)
            }
            transformErrors={handleTransformErrors}
            showErrorList={false}
            liveValidate
          />
        ) : (
          <TextField
            style={{ width: '100%', marginTop: '26px' }}
            className={classes.params}
            disabled
            label="string, string"
            required
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
};
