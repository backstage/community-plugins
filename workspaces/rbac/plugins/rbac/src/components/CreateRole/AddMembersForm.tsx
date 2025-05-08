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
import {
  getChildGroupsCount,
  getMembersCount,
  getParentGroupsCount,
} from '../../utils/create-role-utils';
import { MembersDropdownOption } from './MembersDropdownOption';
import { RoleFormValues, SelectedMember } from './types';

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

export const AddMembersForm = ({
  selectedMembers,
  selectedMembersError,
  setFieldValue,
  membersData,
}: AddMembersFormProps) => {
  const [search, setSearch] = useState<string>('');
  const [selectedMember, setSelectedMember] =
    useState<SelectedMember[]>(selectedMembers);
  useEffect(() => {
    setSelectedMember(selectedMembers);
  }, [selectedMembers]);

  const getDescription = (member: MemberEntity) => {
    const memberCount = getMembersCount(member);
    const parentCount = getParentGroupsCount(member);
    const childCount = getChildGroupsCount(member);

    return member.kind === 'Group'
      ? [
          memberCount > 0 ? `${memberCount} members` : '',
          parentCount > 0 ? `${parentCount} parent group` : '',
          childCount > 0 ? `${childCount} child groups` : '',
        ]
          .filter(Boolean) // Remove any empty strings
          .join(', ')
      : undefined;
  };

  const membersOptions: SelectedMember[] = useMemo(() => {
    return membersData.members
      ? membersData.members.map((member: MemberEntity, index: number) => {
          const tag =
            member.metadata.etag ??
            `${member.metadata.name}-${member.kind}-${index}`;
          return {
            id: tag,
            label: member.spec?.profile?.displayName ?? member.metadata.name,
            description: getDescription(member),
            etag: tag,
            type: member.kind,
            namespace: member.metadata.namespace,
            members: getMembersCount(member),
            ref: stringifyEntityRef(member),
          };
        })
      : ([] as SelectedMember[]);
  }, [membersData.members]);

  const filteredMembers = useMemo(() => {
    if (search) {
      return membersOptions
        .filter(m =>
          m.label
            .toLocaleLowerCase('en-US')
            .includes(search.toLocaleLowerCase('en-US')),
        )
        .slice(0, 99);
    }

    return membersOptions.slice(0, 99);
  }, [membersOptions, search]);

  const handleIsOptionEqualToValue = (
    option: SelectedMember,
    value: SelectedMember,
  ) =>
    value.etag
      ? option.etag === value.etag
      : selectedMember?.[0].etag === value.etag;

  return (
    <>
      <FormHelperText>
        Search and select users and groups to be added. Selected users and
        groups will appear in the table below.
      </FormHelperText>
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
        noOptionsText="No users and groups found."
        clearOnEscape
        renderInput={params => (
          <TextField
            data-testid="users-and-groups-text-field"
            {...params}
            name="add-users-and-groups"
            variant="outlined"
            label="Select users and groups"
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
                      aria-label="clear search"
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
          {`Error fetching user and groups: ${membersData.error.message}`}
        </FormHelperText>
      )}
    </>
  );
};
