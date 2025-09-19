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
import Autocomplete from '@mui/material/Autocomplete';
import type { FocusEventHandler } from 'react';
import { useState, useEffect } from 'react';
import { SelectedPlugin } from '../../types';
import { PluginsDropdownOption } from './PluginsDropdownOption';
import TextField from '@mui/material/TextField';
import { FormikErrors } from 'formik';
import { RoleFormValues } from './types';
import { useTranslation } from '../../hooks/useTranslation';

type PluginsDropdownProps = {
  allPlugins: SelectedPlugin[];
  selectedPlugins: SelectedPlugin[];
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<RoleFormValues>> | Promise<void>;
  handleBlur: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onRemoveAllPlugins: () => void;
  onRemovePlugin: (plugin: string) => void;
  selectedPluginsError: string;
};

const PluginsDropdown = ({
  allPlugins,
  selectedPlugins,
  setFieldValue,
  handleBlur,
  onRemovePlugin,
  onRemoveAllPlugins,
  selectedPluginsError,
}: PluginsDropdownProps) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    if (selectedPlugins.length === allPlugins.length - 1)
      setFieldValue(`selectedPlugins`, allPlugins, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Autocomplete
      options={allPlugins}
      inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        if (reason !== 'reset') {
          setInputValue(newInputValue);
        }
      }}
      renderTags={() => ''}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      multiple
      disableCloseOnSelect
      getOptionLabel={option => option.label}
      noOptionsText={t('permissionPolicies.noPluginsFound')}
      style={{ width: '30%', flexGrow: '1' }}
      value={selectedPlugins || null}
      onChange={(_e, selPlugins, reason, selOption) => {
        const pVal = selOption?.option.value;
        if (pVal === '') {
          if (reason === 'selectOption') {
            setFieldValue(`selectedPlugins`, allPlugins, true);
          } else if (reason === 'removeOption') {
            onRemoveAllPlugins();
          }
        } else if (pVal) {
          if (reason === 'removeOption') {
            onRemovePlugin(pVal);
          } else if (reason === 'selectOption') {
            if (selPlugins.length === allPlugins.length - 1)
              setFieldValue(`selectedPlugins`, allPlugins, true);
            else setFieldValue(`selectedPlugins`, selPlugins, true);
          }
        }
      }}
      renderOption={(props, option: SelectedPlugin, state) => (
        <PluginsDropdownOption props={props} option={option} state={state} />
      )}
      renderInput={(params: any) => (
        <TextField
          {...params}
          label={t('permissionPolicies.selectPlugins')}
          variant="outlined"
          error={!!selectedPluginsError}
          helperText={selectedPluginsError ?? ''}
          onBlur={handleBlur}
          onKeyDown={event => {
            if (event.key === 'Backspace' && params.inputProps.value === '') {
              event.stopPropagation();
            }
          }}
          required
        />
      )}
    />
  );
};

export default PluginsDropdown;
