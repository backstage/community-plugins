/*
 * Copyright 2026 The Backstage Authors
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';
import {
  Button,
  CellText,
  ColumnConfig,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  type Key,
  SearchField,
  Select,
  type Selection,
  Table,
  Text,
  useTable,
} from '@backstage/ui';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './AddMembersModal.module.css';
import { toSelectedMember } from './memberSelectionUtils';
import { SelectedMember } from './types';

type MemberKindFilter = 'user' | 'group' | 'all';

type MemberTableRow = SelectedMember & { id: string };

type MemberFilter = {
  kind?: 'user' | 'group';
  namespace?: string;
};

type AddMembersModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (members: SelectedMember[]) => void;
  /** Members already on the role; shown as checked when the modal reopens. */
  selectedMembers?: SelectedMember[];
};

export const AddMembersModal = ({
  open,
  onClose,
  onAdd,
  selectedMembers = [],
}: AddMembersModalProps) => {
  const { t } = useTranslation();
  const rbacApi = useApi(rbacApiRef);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<MemberKindFilter>('all');
  const [namespaceFilter, setNamespaceFilter] = useState<string>('all');
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [rowById, setRowById] = useState<Record<string, MemberTableRow>>({});
  const [totalItems, setTotalItems] = useState(0);
  // Ignore table selection sync while we seed/re-seed — React Aria can emit an
  // empty selection when the dialog remounts and would wipe pre-checked members.
  const seedSelectionRef = useRef(false);
  const selectedMembersOnOpenRef = useRef(selectedMembers);
  const didReseedForOpenRef = useRef(false);

  useDebounce(() => setDebouncedSearch(searchInput), 300, [searchInput]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    let cancelled = false;
    (async () => {
      const result = await rbacApi.getMemberNamespaces();
      if (cancelled || !Array.isArray(result)) {
        return;
      }
      setNamespaces(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, rbacApi]);

  const seedFromSelectedMembers = useCallback((members: SelectedMember[]) => {
    seedSelectionRef.current = true;
    setSelectedKeys(new Set(members.map(member => member.ref)));
    setRowById(prev => {
      const next = { ...prev };
      for (const member of members) {
        next[member.ref] = { ...member, id: member.ref };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchInput('');
      setDebouncedSearch('');
      setKindFilter('all');
      setNamespaceFilter('all');
      setSelectedKeys(new Set());
      // Keep rowById so a reopen can resolve previously fetched rows / Add targets
      // before useTable refetches.
      didReseedForOpenRef.current = false;
      return undefined;
    }
    // Capture members at open time; reseed again once table data arrives.
    selectedMembersOnOpenRef.current = selectedMembers;
    seedFromSelectedMembers(selectedMembers);
    const timeoutId = window.setTimeout(() => {
      seedSelectionRef.current = false;
    }, 0);
    return () => window.clearTimeout(timeoutId);
    // Intentionally only re-run when `open` flips; capture selectedMembers at open time.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed on open only
  }, [open, seedFromSelectedMembers]);

  const filter = useMemo<MemberFilter>(
    () => ({
      kind: kindFilter === 'all' ? undefined : kindFilter,
      namespace: namespaceFilter === 'all' ? undefined : namespaceFilter,
    }),
    [kindFilter, namespaceFilter],
  );

  const { tableProps } = useTable<MemberTableRow, MemberFilter>({
    mode: 'offset',
    search: debouncedSearch,
    filter,
    initialSort: { column: 'name', direction: 'ascending' },
    getData: async ({
      offset,
      pageSize,
      filter: activeFilter,
      search,
      sort,
    }) => {
      const column = String(sort?.column ?? 'name');
      const orderBy =
        column === 'type' || column === 'namespace' ? column : 'name';
      const orderDirection = sort?.direction === 'descending' ? 'desc' : 'asc';
      const result = await rbacApi.searchMembers({
        searchTerm: search,
        limit: pageSize,
        offset,
        kind: activeFilter?.kind,
        namespace: activeFilter?.namespace,
        orderBy,
        orderDirection,
      });
      if (!('items' in result)) {
        throw new Error(
          (result as Response).statusText || 'Failed to search members',
        );
      }
      const rows = result.items.map((member, index) => {
        const selected = toSelectedMember(member, offset + index, t);
        return { ...selected, id: selected.ref };
      });
      setTotalItems(result.totalItems);
      setRowById(prev => {
        const next = { ...prev };
        for (const row of rows) {
          next[row.id] = row;
        }
        return next;
      });
      return { data: rows, totalCount: result.totalItems };
    },
    paginationOptions: {
      pageSize: 10,
      pageSizeOptions: [10, 25, 50, 100],
      showPageSizeOptions: true,
      showPaginationLabel: true,
    },
  });

  // Re-apply the open-time selection after table data is present. Closing resets
  // filters/search which can refetch; without this, the table's selection sync
  // often clears the seeded checkboxes on reopen.
  useEffect(() => {
    if (!open || !tableProps.data || didReseedForOpenRef.current) {
      return undefined;
    }
    didReseedForOpenRef.current = true;
    const members = selectedMembersOnOpenRef.current;
    seedFromSelectedMembers(members);
    setRowById(prev => {
      const next = { ...prev };
      for (const row of tableProps.data ?? []) {
        next[row.id] = row;
      }
      return next;
    });
    const timeoutId = window.setTimeout(() => {
      seedSelectionRef.current = false;
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [open, tableProps.data, seedFromSelectedMembers]);

  const pageRowIds = useMemo(
    () => (tableProps.data ?? []).map(row => String(row.id)),
    [tableProps.data],
  );

  const handleSelectionChange = useCallback(
    (keys: Selection) => {
      if (seedSelectionRef.current) {
        return;
      }
      const pageIdSet = new Set(pageRowIds);
      setSelectedKeys(prev => {
        const prevIds = [
          ...(prev === 'all' ? pageRowIds : [...prev].map(String)),
        ];
        // Keep selections that are not on the current page (e.g. already on the role).
        const offPage = prevIds.filter(id => !pageIdSet.has(id));
        if (keys === 'all') {
          return new Set([...offPage, ...pageRowIds]);
        }
        return new Set([...offPage, ...[...keys].map(String)]);
      });
    },
    [pageRowIds],
  );

  const columns = useMemo<ColumnConfig<MemberTableRow>[]>(
    () => [
      {
        id: 'name',
        label: t('common.name'),
        isRowHeader: true,
        isSortable: true,
        defaultWidth: '2fr',
        cell: item => <CellText title={item.label} />,
      },
      {
        id: 'type',
        label: t('common.type'),
        isSortable: true,
        defaultWidth: '1fr',
        cell: item => <CellText title={item.type} />,
      },
      {
        id: 'namespace',
        label: t('common.namespace'),
        isSortable: true,
        defaultWidth: '1fr',
        cell: item => <CellText title={item.namespace ?? ''} />,
      },
      {
        id: 'members',
        label: t('common.members'),
        defaultWidth: '1fr',
        cell: item => (
          <CellText
            title={String(item.members ?? (item.type === 'User' ? 1 : 0))}
          />
        ),
      },
    ],
    [t],
  );

  const kindOptions = useMemo(
    () => [
      { id: 'all', label: t('common.kindAll') },
      { id: 'user', label: t('common.user') },
      { id: 'group', label: t('common.group') },
    ],
    [t],
  );

  const namespaceOptions = useMemo(
    () => [
      { id: 'all', label: t('common.namespaceAll') },
      ...namespaces.map(ns => ({ id: ns, label: ns })),
    ],
    [namespaces, t],
  );

  const selectedCount =
    selectedKeys === 'all' ? pageRowIds.length : selectedKeys.size;

  const handleAdd = useCallback(() => {
    const keys =
      selectedKeys === 'all' ? pageRowIds : [...selectedKeys].map(String);
    const pageRows = tableProps.data ?? [];
    const selected = keys
      .map(key => rowById[key] ?? pageRows.find(row => String(row.id) === key))
      .filter((row): row is MemberTableRow => Boolean(row));
    onAdd(selected);
    onClose();
  }, [onAdd, onClose, pageRowIds, rowById, selectedKeys, tableProps.data]);

  const handleKindChange = (value: Key | Key[] | null) => {
    const next = Array.isArray(value) ? value[0] : value;
    setKindFilter((String(next ?? 'all') as MemberKindFilter) || 'all');
  };

  const handleNamespaceChange = (value: Key | Key[] | null) => {
    const next = Array.isArray(value) ? value[0] : value;
    setNamespaceFilter(String(next ?? 'all') || 'all');
  };

  return (
    <Dialog
      isOpen={open}
      isDismissable
      width={1080}
      height={640}
      onOpenChange={isOpen => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogHeader>{t('common.addMembersAndGroups')}</DialogHeader>
      <DialogBody>
        <div className={styles.layout}>
          <div className={styles.filters}>
            <SearchField
              aria-label={t('common.searchByName')}
              value={searchInput}
              onChange={setSearchInput}
              placeholder={t('common.searchByName')}
            />
            <Select
              label={t('common.kind')}
              options={kindOptions}
              value={kindFilter}
              onChange={handleKindChange}
            />
            <Select
              label={t('common.namespace')}
              options={namespaceOptions}
              value={namespaceFilter}
              onChange={handleNamespaceChange}
            />
          </div>
          <div className={styles.results}>
            <Text variant="title-x-small">
              {t('common.allResults' as any, {
                count: String(totalItems),
              })}
            </Text>
            <Table
              columnConfig={columns}
              {...tableProps}
              pagination={
                totalItems === 0 ? { type: 'none' } : tableProps.pagination
              }
              selection={{
                mode: 'multiple',
                selected: selectedKeys,
                onSelectionChange: handleSelectionChange,
              }}
              emptyState={
                <Text
                  variant="body-medium"
                  color="secondary"
                  className={styles.emptyState}
                >
                  {t('common.noMembersMatchSearch')}
                </Text>
              }
            />
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <div className={styles.footer}>
          <Text variant="body-small">
            {t('common.selectedCount' as any, {
              count: String(selectedCount),
            })}
          </Text>
          <div className={styles.footerActions}>
            <Button variant="secondary" onClick={onClose}>
              {t('dialog.cancel')}
            </Button>
            <Button
              variant="primary"
              isDisabled={selectedCount === 0}
              onClick={handleAdd}
            >
              {t('common.add')}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
