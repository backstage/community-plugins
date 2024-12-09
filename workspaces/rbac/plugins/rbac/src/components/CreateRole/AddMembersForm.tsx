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

import { stringifyEntityRef } from '@backstage/catalog-model';

import Autocomplete from '@mui/material/Autocomplete';
import FormHelperText from '@mui/material/FormHelperText';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
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
  const [search, setSearch] = React.useState<string>('');
  const [selectedMember, setSelectedMember] = React.useState<SelectedMember>({
    label: '',
    etag: '',
    type: '',
    ref: '',
  } as SelectedMember);

  const getDescription = (member: MemberEntity) => {
    const memberCount = getMembersCount(member);
    const parentCount = getParentGroupsCount(member);
    const childCount = getChildGroupsCount(member);

    return member.kind === 'Group'
      ? `${memberCount} members, ${parentCount} parent group, ${childCount} child groups`
      : undefined;
  };

  const membersOptions: SelectedMember[] = React.useMemo(() => {
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

  const filteredMembers = React.useMemo(() => {
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
      : selectedMember.etag === value.etag;

  return (
    <>
      <FormHelperText>
        Search and select users and groups to be added. Selected users and
        groups will appear in the members table.
      </FormHelperText>
      <br />
      <Autocomplete
        options={filteredMembers || []}
        getOptionLabel={(option: SelectedMember) => option.label ?? ''}
        isOptionEqualToValue={handleIsOptionEqualToValue}
        loading={membersData.loading}
        loadingText={<LinearProgress />}
        disableClearable
        value={selectedMember}
        onChange={(_e, value: SelectedMember) => {
          setSelectedMember(value);
          if (value) {
            setSearch(value.label);
            setFieldValue('selectedMembers', [...selectedMembers, value]);
          }
        }}
        inputValue={search}
        onInputChange={(_e, newSearch: string, reason) =>
          reason === 'input' && setSearch(newSearch)
        }
        getOptionDisabled={(option: SelectedMember) =>
          !!selectedMembers.find(
            (sm: SelectedMember) => sm.etag === option.etag,
          )
        }
        renderOption={(props, option: SelectedMember, state) => (
          <MembersDropdownOption props={props} option={option} state={state} />
        )}
        noOptionsText="No users and groups found."
        clearOnEscape
        renderInput={params => (
          <TextField
            {...params}
            name="add-users-and-groups"
            variant="outlined"
            label="Users and groups"
            placeholder="Search by user name or group name"
            error={!!selectedMembersError}
            helperText={selectedMembersError ?? ''}
            required
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
