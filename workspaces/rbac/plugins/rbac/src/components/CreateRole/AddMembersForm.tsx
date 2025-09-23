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
import { useState, useEffect, useMemo } from 'react';

import { stringifyEntityRef } from '@backstage/catalog-model';

import Autocomplete from '@mui/material/Autocomplete';
import FormHelperText from '@mui/material/FormHelperText';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from '@mui/material/IconButton';
import { FormikErrors } from 'formik';

import { MemberEntity } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import {
  getChildGroupsCount,
  getMembersCount,
  getParentGroupsCount,
} from '../../utils/create-role-utils';
import { MembersDropdownOption } from './MembersDropdownOption';
import { RoleFormValues, SelectedMember } from './types';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { rbacTranslationRef } from '../../translations';

type AddMembersFormProps = {
  selectedMembers: SelectedMember[];
  selectedMembersError?: string;
  membersData: { members: MemberEntity[]; loading: boolean; error: Error };
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<RoleFormValues>> | Promise<void>;
};

const getDescription = (
  member: MemberEntity,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
) => {
  const memberCount = getMembersCount(member);
  const parentCount = getParentGroupsCount(member);
  const childCount = getChildGroupsCount(member);

  return member.kind === 'Group'
    ? [
        memberCount > 0
          ? t('common.membersCount' as any, { count: memberCount })
          : '',
        parentCount > 0
          ? t('common.parentGroupCount' as any, { count: parentCount })
          : '',
        childCount > 0
          ? t('common.childGroupsCount' as any, { count: childCount })
          : '',
      ]
        .filter(Boolean) // Remove any empty strings
        .join(', ')
    : undefined;
};

export const AddMembersForm = ({
  selectedMembers,
  selectedMembersError,
  setFieldValue,
  membersData,
}: AddMembersFormProps) => {
  const locale = useLanguage();
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>('');
  const [selectedMember, setSelectedMember] =
    useState<SelectedMember[]>(selectedMembers);
  useEffect(() => {
    setSelectedMember(selectedMembers);
  }, [selectedMembers]);

  const membersOptions: SelectedMember[] = useMemo(() => {
    return membersData.members
      ? membersData.members.map((member: MemberEntity, index: number) => {
          const tag =
            member.metadata.etag ??
            `${member.metadata.name}-${member.kind}-${index}`;
          return {
            id: tag,
            label: member.spec?.profile?.displayName ?? member.metadata.name,
            description: getDescription(member, t),
            etag: tag,
            type: member.kind,
            namespace: member.metadata.namespace,
            members: getMembersCount(member),
            ref: stringifyEntityRef(member),
          };
        })
      : ([] as SelectedMember[]);
  }, [membersData.members, t]);

  const filteredMembers = useMemo(() => {
    if (search) {
      return membersOptions
        .filter(m =>
          m.label
            .toLocaleLowerCase(locale)
            .includes(search.toLocaleLowerCase(locale)),
        )
        .slice(0, 99);
    }

    return membersOptions.slice(0, 99);
  }, [membersOptions, search, locale]);

  const handleIsOptionEqualToValue = (
    option: SelectedMember,
    value: SelectedMember,
  ) =>
    value.etag
      ? option.etag === value.etag
      : selectedMember?.[0].etag === value.etag;

  return (
    <>
      <FormHelperText>{t('common.searchAndSelectUsersGroups')}</FormHelperText>
      <br />
      <Autocomplete
        disableCloseOnSelect
        data-testid="users-and-groups-autocomplete"
        sx={{ width: '30%' }}
        multiple
        options={filteredMembers || []}
        getOptionLabel={(option: SelectedMember) => option.label ?? ''}
        isOptionEqualToValue={handleIsOptionEqualToValue}
        loading={membersData.loading}
        loadingText={<LinearProgress />}
        disableClearable
        value={selectedMember}
        onChange={(_e, value: SelectedMember[]) => {
          setSelectedMember(value);
          setFieldValue('selectedMembers', value);
        }}
        renderTags={() => ''}
        inputValue={search}
        onInputChange={(_e, newSearch: string, reason) =>
          reason === 'input' && setSearch(newSearch)
        }
        renderOption={(props, option: SelectedMember, state) => (
          <MembersDropdownOption props={props} option={option} state={state} />
        )}
        noOptionsText={t('common.noUsersAndGroupsFound')}
        clearOnEscape
        renderInput={params => (
          <TextField
            data-testid="users-and-groups-text-field"
            {...params}
            name="add-users-and-groups"
            variant="outlined"
            label={t('common.selectUsersAndGroups')}
            error={!!selectedMembersError}
            helperText={selectedMembersError ?? ''}
            required
            onKeyDown={event => {
              if (event.key === 'Backspace' && params.inputProps.value === '') {
                event.stopPropagation();
              }
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {search && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearch('');
                      }}
                      aria-label={t('common.clearSearch')}
                    >
                      <HighlightOffIcon fontSize="small" />
                    </IconButton>
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      <br />
      {membersData.error?.message && (
        <FormHelperText error={!!membersData.error}>
          {t('common.errorFetchingUserGroups' as any, {
            error: membersData.error.message,
          })}
        </FormHelperText>
      )}
    </>
  );
};
