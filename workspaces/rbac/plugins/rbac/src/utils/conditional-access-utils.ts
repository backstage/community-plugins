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
import { PermissionCondition } from '@backstage/plugin-permission-common';

import { makeStyles, Theme } from '@material-ui/core';
import { RJSFValidationError } from '@rjsf/utils';

import {
  conditionButtons,
  criterias,
} from '../components/ConditionalAccess/const';
import {
  AccessConditionsErrors,
  ComplexErrors,
  Condition,
  ConditionsData,
  NestedCriteriaErrors,
  NotConditionType,
} from '../components/ConditionalAccess/types';

export const ruleOptionDisabled = (
  ruleOption: string,
  conditions?: PermissionCondition[],
) => {
  return !!(conditions || []).find(con => con.rule === ruleOption);
};

export const nestedConditionButtons = conditionButtons.filter(
  button => button.val !== 'condition',
);

export const extractNestedConditions = (
  conditions: Condition[],
  criteriaTypes: string[],
  nestedConditions: Condition[],
) => {
  conditions.forEach(c => {
    criteriaTypes.forEach(ct => {
      if (Object.keys(c).includes(ct)) {
        nestedConditions.push(c);
      }
    });
  });
};

export const getDefaultRule = (selPluginResourceType: string) => ({
  rule: '',
  resourceType: selPluginResourceType,
  params: {},
});

export const makeConditionsFormRowStyles = makeStyles(theme => ({
  conditionRow: {
    padding: '20px',
    border: `1px solid ${theme.palette.border}`,
    borderRadius: '4px',
    backgroundColor: theme.palette.background.default,
    '& input': {
      color: `${theme.palette.textContrast}!important`,
      '&:-internal-autofill-selected, &:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active':
        {
          WebkitBoxShadow: `0 0 0px 1000px ${theme.palette.background.paper} inset`,
          WebkitTextFillColor: `${theme.palette.textContrast}!important`,
          caretColor: `${theme.palette.textContrast}!important`,
        },
    },
    '& button': {
      textTransform: 'none',
    },
  },
  nestedConditionRow: {
    padding: '20px',
    marginLeft: theme.spacing(3),
    border: `1px solid ${theme.palette.border}`,
    borderRadius: '4px',
    backgroundColor: theme.palette.background.default,
    '& input': {
      backgroundColor: `${theme.palette.background.paper}!important`,
    },
  },
  criteriaButtonGroup: {
    backgroundColor: theme.palette.background.paper,
    width: '80%',
  },
  criteriaButton: {
    width: '100%',
    padding: `${theme.spacing(1)}px !important`,
  },
  nestedConditioncriteriaButtonGroup: {
    backgroundColor: theme.palette.background.paper,
    width: '60%',
    height: '100%',
  },
  addRuleButton: {
    display: 'flex !important',
    color: theme.palette.primary.light,
    textTransform: 'none',
  },
  addNestedConditionButton: {
    display: 'flex !important',
    color: theme.palette.primary.light,
    textTransform: 'none',
  },
  removeRuleButton: {
    color: theme.palette.grey[500],
    flexGrow: 0,
    alignSelf: 'baseline',
    marginTop: theme.spacing(3.3),
  },
  removeNestedRuleButton: {
    color: theme.palette.grey[500],
    flexGrow: 0,
    alignSelf: 'baseline',
  },
  radioGroup: {
    margin: theme.spacing(1),
  },
  radioLabel: {
    marginTop: theme.spacing(1),
  },
}));

interface StyleProps {
  isNotSimpleCondition: boolean;
}
export const makeConditionsFormRowFieldsStyles = makeStyles<Theme, StyleProps>(
  theme => ({
    bgPaper: {
      backgroundColor: theme.palette.background.paper,
    },
    params: {
      '& div[class*="MuiInputBase-root"]': {
        backgroundColor: theme.palette.background.paper,
      },
      '& span': {
        color: theme.palette.textSubtle,
      },
      '& input': {
        color: theme.palette.textContrast,
      },
      '& fieldset.MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.grey[500],
      },
      '& div.MuiOutlinedInput-root': {
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.light,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.status.error,
          '&:hover': {
            borderColor: theme.palette.status.error,
          },
        },
      },
      '& label.MuiFormLabel-root.Mui-focused': {
        color: theme.palette.primary.light,
      },
      '& label.MuiFormLabel-root.Mui-error': {
        color: theme.palette.status.error,
      },
      '& div.MuiOutlinedInput-root:hover fieldset': {
        borderColor:
          theme.palette.type === 'dark' ? theme.palette.textContrast : 'unset',
      },
      '& label': {
        color: theme.palette.textSubtle,
      },
    },
    inputFieldContainer: {
      display: 'flex',
      flexFlow: 'row',
      gap: '10px',
      flexGrow: 1,
      margin: ({ isNotSimpleCondition }) =>
        isNotSimpleCondition ? '-1.5rem 0 0 1.85rem' : '0',
    },
  }),
);

export const getSimpleRulesCount = (
  conditionRow: ConditionsData,
  criteria: string,
): number => {
  if (criteria === criterias.not) {
    return (conditionRow[criteria as keyof Condition] as PermissionCondition)
      .resourceType
      ? 1
      : 0;
  }
  if (criteria === criterias.condition) {
    return 1;
  }
  return (conditionRow[criteria as keyof Condition] as Condition[]).filter(
    (e: Condition) => 'rule' in e,
  ).length;
};

export const initializeErrors = (
  criteria: keyof ConditionsData,
  conditions: ConditionsData,
): AccessConditionsErrors => {
  const errors: AccessConditionsErrors = {};
  const initialize = (cond: Condition | ConditionsData): ComplexErrors => {
    if ('rule' in cond) {
      return '';
    }

    const nestedErrors: NestedCriteriaErrors = {};
    if (cond.allOf) {
      nestedErrors.allOf = (cond.allOf.map(initialize) as string[]) || [];
    }
    if (cond.anyOf) {
      nestedErrors.anyOf = (cond.anyOf.map(initialize) as string[]) || [];
    }
    if (cond.not) {
      nestedErrors.not = (initialize(cond.not) as string) || '';
    }

    return nestedErrors;
  };

  if (criteria === criterias.condition) {
    errors.condition = '';
  } else if (criteria === criterias.not) {
    const notCondition = conditions.not;

    let notConditionType;
    if (notCondition === undefined) {
      notConditionType = NotConditionType.SimpleCondition;
    } else if ('rule' in notCondition) {
      notConditionType = NotConditionType.SimpleCondition;
    } else {
      notConditionType = NotConditionType.NestedCondition;
    }

    if (notConditionType === NotConditionType.SimpleCondition) {
      errors.not = '';
    } else {
      errors.not = initialize(conditions.not!);
    }
  } else if (criteria === criterias.allOf || criteria === criterias.anyOf) {
    errors[criteria] = Array.isArray(conditions[criteria])
      ? (conditions[criteria] as Condition[]).map(initialize)
      : [''];
  }

  return errors;
};

export const resetErrors = (
  criteria: string,
  notConditionType = NotConditionType.SimpleCondition,
): AccessConditionsErrors => {
  const errors: AccessConditionsErrors = {};

  if (
    criteria === criterias.condition ||
    (criteria === criterias.not &&
      notConditionType === NotConditionType.SimpleCondition)
  ) {
    errors[criteria] = '';
  }

  if (criteria === criterias.allOf || criteria === criterias.anyOf) {
    errors[criteria] = [''] as ComplexErrors[];
  }

  if (
    criteria === criterias.not &&
    notConditionType === NotConditionType.NestedCondition
  ) {
    (errors[criteria] as ComplexErrors) = { [criterias.allOf]: [''] };
  }

  return errors;
};

export const setErrorMessage = (errors: RJSFValidationError[]) =>
  errors[0] ? `Error in the ${errors[0].property} field.` : '';

export const getSimpleRuleErrors = (errors: ComplexErrors[]): string[] =>
  (errors.filter(
    (err: ComplexErrors) => typeof err === 'string',
  ) as string[]) || [];

export const getNestedRuleErrors = (
  errors: ComplexErrors[],
): NestedCriteriaErrors[] =>
  (errors.filter(
    (err: ComplexErrors) => typeof err !== 'string',
  ) as NestedCriteriaErrors[]) || [];

export const isNestedConditionRule = (r: Condition): boolean => {
  return (
    criterias.allOf in (r as ConditionsData) ||
    criterias.anyOf in (r as ConditionsData) ||
    criterias.not in (r as ConditionsData)
  );
};

export const getNestedConditionSimpleRulesCount = (
  nc: Condition,
  c: string,
): number => {
  if (c === criterias.not) {
    return (nc[c as keyof Condition] as PermissionCondition).resourceType
      ? 1
      : 0;
  }

  return (nc[c as keyof Condition] as Condition[]).filter(
    r => 'resourceType' in r,
  ).length;
};

export const getRowStyle = (c: Condition, isNestedCondition: boolean) =>
  isNestedCondition
    ? {
        display:
          (c as PermissionCondition).rule !== undefined ? 'flex' : 'none',
      }
    : { display: 'flex', gap: '10px' };

export const getRowKey = (isNestedCondition: boolean, ruleIndex: number) =>
  isNestedCondition
    ? `nestedCondition-rule-${ruleIndex}`
    : `condition-rule-${ruleIndex}`;

export const hasAllOfOrAnyOfErrors = (
  errors: AccessConditionsErrors,
  criteria: string,
): boolean => {
  if (!errors) return false;

  const criteriaErrors = errors[
    criteria as keyof AccessConditionsErrors
  ] as ComplexErrors[];
  const simpleRuleErrors = criteriaErrors.filter(
    e => typeof e === 'string',
  ) as string[];
  const nestedRuleErrors = criteriaErrors.filter(
    e => typeof e !== 'string',
  ) as NestedCriteriaErrors[];

  if (simpleRuleErrors.some(e => e.length > 0)) {
    return true;
  }

  return nestedRuleErrors.some(err => {
    const nestedCriteria = Object.keys(err)[0] as keyof NestedCriteriaErrors;
    const nestedErrors = err[nestedCriteria];

    if (Array.isArray(nestedErrors)) {
      return nestedErrors.some(e => e.length > 0);
    }
    return nestedErrors?.length > 0;
  });
};

export const hasSimpleConditionOrNotErrors = (
  errors: AccessConditionsErrors,
  criteria: string,
): boolean => {
  if (!errors) return false;
  return (
    ((errors[criteria as keyof AccessConditionsErrors] as string) || '')
      .length > 0
  );
};

export const hasNestedNotErrors = (
  errors: AccessConditionsErrors,
  conditions: ConditionsData,
  criteria: keyof ConditionsData,
): boolean => {
  if (!errors) return false;
  const nestedCriteria = Object.keys(conditions[criteria]!)[0];
  const nestedErrors = (
    errors[
      criterias.not as keyof AccessConditionsErrors
    ] as NestedCriteriaErrors
  )[nestedCriteria];

  if (Array.isArray(nestedErrors)) {
    return nestedErrors.some(e => e.length > 0);
  }
  return nestedErrors?.length > 0;
};

export const isSimpleRule = (con: Condition): boolean => 'rule' in con;
