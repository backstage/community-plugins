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
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from 'react-use';

import { stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';

import Autocomplete, {
  AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from '@mui/material/IconButton';
import { FormikErrors } from 'formik';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { MemberEntity } from '../../types';
import { MembersDropdownOption } from './MembersDropdownOption';
import { RoleFormValues, SelectedMember } from './types';
import { useTranslation } from '../../hooks/useTranslation';
import { AddMembersModal } from './AddMembersModal';
import {
  MEMBERS_MODAL_THRESHOLD,
  toSelectedMember,
} from './memberSelectionUtils';

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
  const { t } = useTranslation();
  const rbacApi = useApi(rbacApiRef);
  const [search, setSearch] = useState<string>('');
  const [selectedMember, setSelectedMember] =
    useState<SelectedMember[]>(selectedMembers);
  useEffect(() => {
    setSelectedMember(selectedMembers);
  }, [selectedMembers]);

  const [searchResults, setSearchResults] = useState<MemberEntity[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [catalogTotal, setCatalogTotal] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await rbacApi.searchMembers({ limit: 1 });
        if (cancelled) {
          return;
        }
        if ('totalItems' in result) {
          setCatalogTotal(result.totalItems);
        }
      } catch {
        if (!cancelled) {
          setCatalogTotal(0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rbacApi]);

  const useModal =
    catalogTotal !== null && catalogTotal > MEMBERS_MODAL_THRESHOLD;

  const performSearch = useCallback(
    async (term: string) => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const result = await rbacApi.searchMembers({
          searchTerm: term,
          limit: 100,
        });
        if ('items' in result) {
          setSearchResults(result.items);
        } else {
          setSearchError(
            t('common.errorFetchingUserGroups' as any, {
              error: (result as Response).statusText || '',
            }),
          );
        }
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : String(err));
      } finally {
        setSearchLoading(false);
      }
    },
    [rbacApi, t],
  );

  useDebounce(
    () => {
      if (!useModal) {
        performSearch(search);
      }
    },
    300,
    [search, useModal],
  );

  const membersOptions: SelectedMember[] = useMemo(() => {
    const searchEntities = Array.isArray(searchResults) ? searchResults : [];
    const initialEntities = membersData.members ?? [];
    const primary = search ? searchEntities : initialEntities;
    const secondary = search ? initialEntities : searchEntities;
    const seen = new Set<string>();
    const unique: MemberEntity[] = [];
    for (const entity of primary) {
      const ref = stringifyEntityRef(entity);
      if (!seen.has(ref)) {
        seen.add(ref);
        unique.push(entity);
      }
    }
    for (const entity of secondary) {
      const ref = stringifyEntityRef(entity);
      if (!seen.has(ref)) {
        seen.add(ref);
        unique.push(entity);
      }
    }
    return unique.map((member, index) => toSelectedMember(member, index, t));
  }, [searchResults, membersData.members, search, t]);

  const handleIsOptionEqualToValue = useCallback(
    (option: SelectedMember, value: SelectedMember) =>
      option.etag === value.etag,
    [],
  );

  const handleGetOptionLabel = useCallback(
    (option: SelectedMember) => option.label ?? '',
    [],
  );

  const handleChange = useCallback(
    (_e: React.SyntheticEvent, value: SelectedMember[]) => {
      setSelectedMember(value);
      setFieldValue('selectedMembers', value, false);
    },
    [setFieldValue],
  );

  const handleInputChange = useCallback(
    (_e: React.SyntheticEvent, newSearch: string, reason: string) => {
      if (reason === 'input') setSearch(newSearch);
    },
    [],
  );

  const handleFilterOptions = useCallback((x: SelectedMember[]) => x, []);

  const handleRenderOption = useCallback(
    (
      props: React.HTMLAttributes<HTMLLIElement>,
      option: SelectedMember,
      state: AutocompleteRenderOptionState,
    ) => <MembersDropdownOption props={props} option={option} state={state} />,
    [],
  );

  // Modal selection is the source of truth (includes unchecks on reopen/edit).
  const handleModalAdd = useCallback(
    (members: SelectedMember[]) => {
      setSelectedMember(members);
      setFieldValue('selectedMembers', members, false);
    },
    [setFieldValue],
  );

  if (useModal) {
    return (
      <>
        <FormHelperText>{t('common.searchAndFilterCatalog')}</FormHelperText>
        <br />
        <Button
          variant="outlined"
          color="primary"
          type="button"
          data-testid="add-members-button"
          sx={{ borderRadius: '99em' }}
          onClick={() => setModalOpen(true)}
        >
          {t('common.add')}
        </Button>
        {selectedMembersError && (
          <FormHelperText error>{selectedMembersError}</FormHelperText>
        )}
        <AddMembersModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleModalAdd}
          selectedMembers={selectedMember}
        />
        {membersData.error?.message && (
          <FormHelperText error={!!membersData.error}>
            {t('common.errorFetchingUserGroups' as any, {
              error: membersData.error.message,
            })}
          </FormHelperText>
        )}
        <br />
      </>
    );
  }

  return (
    <>
      <FormHelperText>{t('common.searchAndSelectUsersGroups')}</FormHelperText>
      <br />
      <Autocomplete
        disableCloseOnSelect
        data-testid="users-and-groups-autocomplete"
        sx={{ width: '30%' }}
        multiple
        options={membersOptions}
        getOptionLabel={handleGetOptionLabel}
        isOptionEqualToValue={handleIsOptionEqualToValue}
        loading={searchLoading || catalogTotal === null}
        loadingText={<LinearProgress />}
        disableClearable
        value={selectedMember}
        onChange={handleChange}
        renderTags={() => ''}
        inputValue={search}
        onInputChange={handleInputChange}
        filterOptions={handleFilterOptions}
        renderOption={handleRenderOption}
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
      {searchError && <FormHelperText error>{searchError}</FormHelperText>}
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
