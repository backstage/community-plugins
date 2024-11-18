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

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { useTheme } from '@mui/material/styles';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {
  extractNestedConditions,
  getDefaultRule,
  getNestedConditionSimpleRulesCount,
  getSimpleRulesCount,
  isNestedConditionRule,
  isSimpleRule,
  nestedConditionButtons,
  resetErrors,
  ruleOptionDisabled,
} from '../../utils/conditional-access-utils';
import { AddNestedConditionButton } from './AddNestedConditionButton';
import { ComplexConditionRow } from './ComplexConditionRow';
import { ComplexConditionRowButtons } from './ComplexConditionRowButtons';
import { ConditionRule } from './ConditionRule';
import { ConditionsFormRowFields } from './ConditionsFormRowFields';
import { conditionButtons, criterias } from './const';
import { CriteriaToggleButton } from './CriteriaToggleButton';
import {
  ComplexErrors,
  Condition,
  ConditionFormRowProps,
  ConditionsData,
  NestedCriteriaErrors,
  NotConditionType,
} from './types';

export const ConditionsFormRow = ({
  conditionRulesData,
  conditionRow,
  selPluginResourceType,
  criteria,
  onRuleChange,
  setCriteria,
  setErrors,
  setRemoveAllClicked,
}: ConditionFormRowProps) => {
  const theme = useTheme();
  const [nestedConditionRow, setNestedConditionRow] = React.useState<
    Condition[]
  >([]);
  const [notConditionType, setNotConditionType] =
    React.useState<NotConditionType>(NotConditionType.SimpleCondition);

  React.useEffect(() => {
    const nestedConditions: Condition[] = [];
    const criteriaTypes = [criterias.allOf, criterias.anyOf, criterias.not];
    switch (criteria) {
      case criterias.allOf:
        extractNestedConditions(
          conditionRow.allOf || [],
          criteriaTypes,
          nestedConditions,
        );
        break;
      case criterias.anyOf:
        extractNestedConditions(
          conditionRow.anyOf || [],
          criteriaTypes,
          nestedConditions,
        );
        break;
      case criterias.not:
        if (
          conditionRow.not &&
          criteriaTypes.includes(
            Object.keys(conditionRow.not)[0] as keyof ConditionsData,
          )
        ) {
          nestedConditions.push(conditionRow.not);
          setNotConditionType(NotConditionType.NestedCondition);
        }
        break;
      default:
        break;
    }

    setNestedConditionRow(nestedConditions);
  }, [conditionRow, criteria]);

  const handleCriteriaChange = (val: keyof ConditionsData) => {
    setCriteria(val);
    setErrors(resetErrors(val));

    const defaultRule = getDefaultRule(selPluginResourceType);

    const ruleMap = {
      [criterias.condition]: { condition: defaultRule },
      [criterias.allOf]: { allOf: [defaultRule] },
      [criterias.anyOf]: { anyOf: [defaultRule] },
      [criterias.not]: { not: defaultRule },
    };

    if (val === criterias.not) {
      setNotConditionType(NotConditionType.SimpleCondition);
    }

    const ruleChange = ruleMap[val];
    if (ruleChange) {
      onRuleChange(ruleChange);
    }
  };

  const updateRules = (updatedNestedConditionRow: Condition[] | Condition) => {
    const existingSimpleCondition =
      criteria !== criterias.not
        ? (conditionRow[criteria as keyof Condition] as Condition[])?.filter(
            con => isSimpleRule(con),
          ) || []
        : [];

    const newCondition: Condition[] = Array.isArray(updatedNestedConditionRow)
      ? [...existingSimpleCondition, ...updatedNestedConditionRow]
      : [...existingSimpleCondition, updatedNestedConditionRow];

    if (criteria === criterias.anyOf || criteria === criterias.allOf) {
      onRuleChange({
        [criteria]: newCondition,
      });
    } else if (
      criteria === criterias.not &&
      !Array.isArray(updatedNestedConditionRow)
    ) {
      onRuleChange({
        not: updatedNestedConditionRow,
      });
    }
  };

  const handleNestedConditionCriteriaChange = (
    val: string,
    nestedConditionIndex: number,
  ) => {
    const defaultRule = getDefaultRule(selPluginResourceType);

    const nestedConditionMap = {
      [criterias.not]: { [val]: defaultRule },
      [criterias.allOf]: { [val]: [defaultRule] },
      [criterias.anyOf]: { [val]: [defaultRule] },
      [criterias.condition]: { [val]: [defaultRule] },
    };

    const newCondition = nestedConditionMap[val] || { [val]: [defaultRule] };

    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors[criteria] !== undefined) {
        if (criteria === criterias.not) {
          (updatedErrors[criteria] as ComplexErrors) =
            val !== criterias.not ? { [val]: [''] } : { [val]: '' };
          return updatedErrors;
        }
        const criteriaErrors = updatedErrors[criteria];
        const simpleRuleErrors = (criteriaErrors as ComplexErrors[]).filter(
          (err: ComplexErrors) => typeof err === 'string',
        );
        const nestedConditionErrors = (
          criteriaErrors as ComplexErrors[]
        ).filter((err: ComplexErrors) => typeof err !== 'string');
        nestedConditionErrors[nestedConditionIndex] =
          val !== criterias.not ? { [val]: [''] } : { [val]: '' };
        updatedErrors[criteria] = [
          ...simpleRuleErrors,
          ...nestedConditionErrors,
        ];
      }

      return updatedErrors;
    });

    if (criteria === criterias.not) {
      updateRules(newCondition);
    } else {
      const updatedNestedConditionRow = nestedConditionRow.map((c, index) => {
        if (index === nestedConditionIndex) {
          return newCondition;
        }
        return c;
      });
      updateRules(updatedNestedConditionRow);
    }
  };

  const handleAddNestedCondition = (currentCriteria: string) => {
    const newNestedCondition = {
      [criterias.allOf]: [getDefaultRule(selPluginResourceType)],
    };
    const updatedNestedConditionRow = [
      ...nestedConditionRow,
      newNestedCondition,
    ];
    updateRules(
      currentCriteria === criterias.not
        ? newNestedCondition
        : updatedNestedConditionRow,
    );

    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };
      if (updatedErrors[currentCriteria]) {
        const criteriaErrors = updatedErrors[
          currentCriteria
        ] as ComplexErrors[];
        if (Array.isArray(criteriaErrors)) {
          criteriaErrors.push({ [criterias.allOf]: [''] });
        } else {
          (updatedErrors[currentCriteria] as ComplexErrors) = {
            [criterias.allOf]: [''],
          };
        }
      }
      return updatedErrors;
    });
  };

  const handleNotConditionTypeChange = (val: NotConditionType) => {
    setNotConditionType(val);
    setErrors(resetErrors(criteria, val));
    if (val === 'nested-condition') {
      handleAddNestedCondition(criterias.not);
    } else {
      onRuleChange({
        not: getDefaultRule(selPluginResourceType),
      });
    }
  };

  const handleAddRuleInNestedCondition = (
    nestedConditionCriteria: string,
    nestedConditionIndex: number,
  ) => {
    const updatedNestedConditionRow: Condition[] = [];

    nestedConditionRow.forEach((c, index) => {
      if (index === nestedConditionIndex) {
        updatedNestedConditionRow.push({
          [nestedConditionCriteria as keyof Condition]: [
            ...((c[
              nestedConditionCriteria as keyof Condition
            ] as PermissionCondition[]) || []),
            getDefaultRule(selPluginResourceType),
          ],
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
        const criteriaErrors = updatedErrors[criteria];
        if (
          criteria === criterias.not &&
          notConditionType === 'nested-condition'
        ) {
          (
            (criteriaErrors as NestedCriteriaErrors)[
              nestedConditionCriteria
            ] as string[]
          ).push('');
          return updatedErrors;
        }
        const simpleRuleErrors = (criteriaErrors as ComplexErrors[]).filter(
          (err: ComplexErrors) => typeof err === 'string',
        );
        const nestedConditionErrors = (
          criteriaErrors as ComplexErrors[]
        ).filter((err: ComplexErrors) => typeof err !== 'string');

        (
          ((
            nestedConditionErrors[nestedConditionIndex] as NestedCriteriaErrors
          )[nestedConditionCriteria] as string[]) || []
        ).push('');
        updatedErrors[criteria] = [
          ...simpleRuleErrors,
          ...nestedConditionErrors,
        ];
      }
      return updatedErrors;
    });
  };

  const handleRemoveNestedCondition = (nestedConditionIndex: number) => {
    const updatedNestedConditionRow = nestedConditionRow.filter(
      (_, index) => index !== nestedConditionIndex,
    );

    updateRules(updatedNestedConditionRow);
    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors[criteria] !== undefined) {
        const criteriaErrors = updatedErrors[criteria] as ComplexErrors[];
        const simpleRuleErrors = criteriaErrors.filter(
          (err: ComplexErrors) => typeof err === 'string',
        );
        const nestedConditionErrors = criteriaErrors.filter(
          (err: ComplexErrors) => typeof err !== 'string',
        );
        nestedConditionErrors.splice(nestedConditionIndex, 1);

        updatedErrors[criteria] = [
          ...simpleRuleErrors,
          ...nestedConditionErrors,
        ];
      }

      return updatedErrors;
    });
  };

  const updateErrors = (_index: number) => {
    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };

      if (!Array.isArray(updatedErrors[criteria])) {
        updatedErrors[criteria] = [];
      }

      const firstNestedConditionErrorIndex =
        (updatedErrors[criteria] as ComplexErrors[]).findIndex(
          e => typeof e !== 'string',
        ) || 0;

      (updatedErrors[criteria] as ComplexErrors[]).splice(
        firstNestedConditionErrorIndex,
        0,
        '',
      );

      return updatedErrors;
    });
  };

  const renderNestedConditionRow = (
    nc: Condition,
    nestedConditionIndex: number,
  ) => {
    const selectedNestedConditionCriteria = Object.keys(nc)[0];
    const simpleRulesCount = getSimpleRulesCount(conditionRow, criteria);
    const nestedConditionsCount = nestedConditionRow.length;
    const nestedConditionSimpleRulesCount = getNestedConditionSimpleRulesCount(
      nc,
      selectedNestedConditionCriteria,
    );
    return (
      nestedConditionSimpleRulesCount > 0 && (
        <Box
          mt={2}
          key={`nestedCondition-${nestedConditionIndex}`}
          sx={{
            padding: '20px',
            marginLeft: theme.spacing(3),
            border: `1px solid ${theme.palette.border}`,
            borderRadius: '4px',
            backgroundColor: theme.palette.background.default,
            '& input': {
              backgroundColor: `${theme.palette.background.paper}!important`,
            },
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <ToggleButtonGroup
              exclusive
              value={selectedNestedConditionCriteria}
              onChange={(_event, newNestedCriteria) =>
                handleNestedConditionCriteriaChange(
                  newNestedCriteria,
                  nestedConditionIndex,
                )
              }
              sx={{
                backgroundColor: theme.palette.background.paper,
                width: '60%',
                height: '100%',
              }}
            >
              {nestedConditionButtons.map(({ val, label }) => (
                <CriteriaToggleButton
                  key={`nested-criteria-${val}`}
                  val={val}
                  label={label}
                  selectedCriteria={selectedNestedConditionCriteria}
                  theme={theme}
                />
              ))}
            </ToggleButtonGroup>
            {criteria !== criterias.not && (
              <IconButton
                title="Remove nested condition"
                sx={{
                  color: theme.palette.grey[500],
                  flexGrow: 0,
                  alignSelf: 'baseline',
                }}
                disabled={simpleRulesCount === 0 && nestedConditionsCount === 1} // 0 simple rules and this is the only 1 nested condition
                onClick={() =>
                  handleRemoveNestedCondition(nestedConditionIndex)
                }
              >
                <RemoveIcon data-testid="remove-nested-condition" />
              </IconButton>
            )}
          </div>
          <Box>
            {selectedNestedConditionCriteria !== criterias.not &&
              (
                nc[
                  selectedNestedConditionCriteria as keyof Condition
                ] as PermissionCondition[]
              ).map((c, ncrIndex) => (
                <ComplexConditionRow
                  key={`nested-condition-${nestedConditionIndex}-${ncrIndex}`}
                  conditionRow={conditionRow}
                  nestedConditionRow={nestedConditionRow}
                  criteria={criteria}
                  onRuleChange={onRuleChange}
                  updateRules={updateRules}
                  setErrors={setErrors}
                  setRemoveAllClicked={setRemoveAllClicked}
                  conditionRulesData={conditionRulesData}
                  notConditionType={notConditionType}
                  currentCondition={c}
                  ruleIndex={ncrIndex}
                  isNestedCondition
                  nestedConditionIndex={nestedConditionIndex}
                  activeNestedCriteria={
                    selectedNestedConditionCriteria as 'allOf' | 'anyOf'
                  }
                />
              ))}
            {selectedNestedConditionCriteria === criterias.not &&
              ((nc as ConditionsData).not as PermissionCondition)
                .resourceType && (
                <ConditionsFormRowFields
                  oldCondition={
                    (nc as ConditionsData).not ??
                    getDefaultRule(selPluginResourceType)
                  }
                  onRuleChange={onRuleChange}
                  conditionRow={conditionRow}
                  criteria={criteria}
                  conditionRulesData={conditionRulesData}
                  setErrors={setErrors}
                  optionDisabled={ruleOption =>
                    ruleOptionDisabled(
                      ruleOption,
                      (nc as ConditionsData).not
                        ? [(nc as ConditionsData).not as PermissionCondition]
                        : undefined,
                    )
                  }
                  setRemoveAllClicked={setRemoveAllClicked}
                  nestedConditionRow={nestedConditionRow}
                  nestedConditionCriteria={selectedNestedConditionCriteria}
                  nestedConditionIndex={nestedConditionIndex}
                  updateRules={updateRules}
                />
              )}
            {selectedNestedConditionCriteria !== criterias.not && (
              <Button
                sx={{
                  mt: 1,
                  color: theme.palette.primary.light,
                }}
                size="small"
                onClick={() =>
                  handleAddRuleInNestedCondition(
                    selectedNestedConditionCriteria,
                    nestedConditionIndex,
                  )
                }
                startIcon={<AddIcon fontSize="small" />}
              >
                Add rule
              </Button>
            )}
          </Box>
        </Box>
      )
    );
  };

  return (
    <Box
      sx={{
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
      }}
      data-testid="conditions-row"
    >
      <ToggleButtonGroup
        exclusive
        value={criteria}
        onChange={(_event, newCriteria) => handleCriteriaChange(newCriteria)}
        sx={{
          backgroundColor: theme.palette.background.paper,
          width: '80%',
        }}
      >
        {conditionButtons.map(({ val, label }) => (
          <CriteriaToggleButton
            key={`criteria-${val}`}
            val={val}
            label={label}
            selectedCriteria={criteria}
            theme={theme}
          />
        ))}
      </ToggleButtonGroup>
      <ConditionRule
        conditionRow={conditionRow}
        selPluginResourceType={selPluginResourceType}
        onRuleChange={onRuleChange}
        criteria={criteria}
        conditionRulesData={conditionRulesData}
        setErrors={setErrors}
        setRemoveAllClicked={setRemoveAllClicked}
      />
      {criteria !== criterias.condition && (
        <Box>
          {criteria !== criterias.not &&
            (conditionRow[criteria] as PermissionCondition[])?.map(
              (c, srIndex) => (
                <ComplexConditionRow
                  key={`${criteria}-simple-condition-${srIndex}`}
                  conditionRow={conditionRow}
                  nestedConditionRow={nestedConditionRow}
                  criteria={criteria}
                  onRuleChange={onRuleChange}
                  updateRules={updateRules}
                  setErrors={setErrors}
                  setRemoveAllClicked={setRemoveAllClicked}
                  conditionRulesData={conditionRulesData}
                  notConditionType={notConditionType}
                  currentCondition={c}
                  ruleIndex={srIndex}
                  activeCriteria={criteria as 'allOf' | 'anyOf'}
                />
              ),
            )}
          {criteria === criterias.not && (
            <RadioGroup
              sx={{
                margin: theme.spacing(1),
              }}
              value={notConditionType}
              onChange={(_event, value) =>
                handleNotConditionTypeChange(value as NotConditionType)
              }
            >
              <FormControlLabel
                value={NotConditionType.SimpleCondition}
                control={<Radio color="primary" />}
                label="Add rule"
                sx={{
                  marginTop: theme.spacing(1),
                }}
              />
              {notConditionType === NotConditionType.SimpleCondition && (
                <ConditionsFormRowFields
                  oldCondition={
                    conditionRow.not ?? getDefaultRule(selPluginResourceType)
                  }
                  onRuleChange={onRuleChange}
                  conditionRow={conditionRow}
                  criteria={criteria}
                  conditionRulesData={conditionRulesData}
                  setErrors={setErrors}
                  optionDisabled={ruleOption =>
                    ruleOptionDisabled(
                      ruleOption,
                      conditionRow.not
                        ? [conditionRow.not as PermissionCondition]
                        : undefined,
                    )
                  }
                  setRemoveAllClicked={setRemoveAllClicked}
                />
              )}
              <FormControlLabel
                value={NotConditionType.NestedCondition}
                control={<Radio color="primary" />}
                label={<AddNestedConditionButton />}
                sx={{
                  marginTop: theme.spacing(1),
                }}
              />
            </RadioGroup>
          )}
          <ComplexConditionRowButtons
            conditionRow={conditionRow}
            onRuleChange={onRuleChange}
            criteria={criteria}
            selPluginResourceType={selPluginResourceType}
            updateErrors={updateErrors}
            isNestedConditionRule={isNestedConditionRule}
            handleAddNestedCondition={handleAddNestedCondition}
          />
          {nestedConditionRow?.length > 0 &&
            nestedConditionRow.map((nc, nestedConditionIndex) =>
              renderNestedConditionRow(nc, nestedConditionIndex),
            )}
        </Box>
      )}
    </Box>
  );
};
