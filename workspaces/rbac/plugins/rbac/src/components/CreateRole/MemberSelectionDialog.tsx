/*
 * Copyright 2025 The Backstage Authors
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
import {
  GroupEntity,
  stringifyEntityRef,
  UserEntity,
} from '@backstage/catalog-model';
import { Table, TableColumn, Progress } from '@backstage/core-components';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Box,
  makeStyles,
  createStyles,
  Theme,
  IconButton,
} from '@material-ui/core';
import CloseIcon from '@mui/icons-material/Close';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { rbacTranslationRef } from '../../translations';
import { SelectedMember } from './types';
import { MemberEntity } from '../../types';
import {
  getChildGroupsCount,
  getMembersCount,
  getParentGroupsCount,
} from '../../utils/create-role-utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogCloseButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  }),
);

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
        .filter(Boolean)
        .join(', ')
    : undefined;
};

const entityToSelectedMember = (
  entity: MemberEntity,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
): SelectedMember => {
  const ref = stringifyEntityRef(entity);
  return {
    id: entity.metadata.etag ?? ref,
    label: entity.spec?.profile?.displayName ?? entity.metadata.name,
    description: getDescription(entity, t),
    etag: entity.metadata.etag ?? ref,
    type: entity.kind,
    namespace: entity.metadata.namespace,
    members: getMembersCount(entity),
    ref: ref,
  };
};

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const userColumns: TableColumn<UserEntity>[] = [
  { title: 'Name', field: 'spec.profile.displayName' },
  { title: 'Email', field: 'spec.profile.email' },
  { title: 'User ID', field: 'metadata.name' },
];

const groupColumns: TableColumn<GroupEntity>[] = [
  { title: 'Name', field: 'spec.profile.displayName' },
  { title: 'Description', field: 'metadata.description', width: '70%' },
  { title: 'Group ID', field: 'metadata.name' },
];

// --- Props for the new Dialog component ---

export interface MemberSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (selection: SelectedMember[]) => void;
  initialSelectedMembers: SelectedMember[];
  allUsers: UserEntity[];
  allGroups: GroupEntity[];
  isLoading: boolean;
  t: TranslationFunction<typeof rbacTranslationRef.T>;
}

export const MemberSelectionDialog = (props: MemberSelectionDialogProps) => {
  const {
    open,
    onClose,
    onApply,
    initialSelectedMembers,
    allUsers,
    allGroups,
    isLoading,
    t,
  } = props;
  const classes = useStyles();

  // Internal state for the dialog's selections
  const [tabValue, setTabValue] = useState(0);
  const [dialogSelectedUsers, setDialogSelectedUsers] = useState<UserEntity[]>(
    [],
  );
  const [dialogSelectedGroups, setDialogSelectedGroups] = useState<
    GroupEntity[]
  >([]);

  // Initialize internal state when the dialog opens
  useEffect(() => {
    if (open) {
      const selectedRefs = new Set(initialSelectedMembers.map(m => m.ref));
      setDialogSelectedUsers(
        allUsers.filter(u => selectedRefs.has(stringifyEntityRef(u))),
      );
      setDialogSelectedGroups(
        allGroups.filter(g => selectedRefs.has(stringifyEntityRef(g))),
      );
    }
  }, [open, initialSelectedMembers, allUsers, allGroups]);

  // Memoize data to prepare it for the tables
  const tableUsers = useMemo(() => {
    const selectedUserRefs = new Set(
      dialogSelectedUsers.map(stringifyEntityRef),
    );
    return allUsers.map(user => ({
      ...user,
      tableData: {
        checked: selectedUserRefs.has(stringifyEntityRef(user)),
      },
    }));
  }, [allUsers, dialogSelectedUsers]);

  const tableGroups = useMemo(() => {
    const selectedGroupRefs = new Set(
      dialogSelectedGroups.map(stringifyEntityRef),
    );
    return allGroups.map(group => ({
      ...group,
      tableData: {
        checked: selectedGroupRefs.has(stringifyEntityRef(group)),
      },
    }));
  }, [allGroups, dialogSelectedGroups]);

  // Handlers for table selection
  const onUserSelectionChange = (rows: UserEntity[]) => {
    setDialogSelectedUsers(rows);
  };

  const onGroupSelectionChange = (rows: GroupEntity[]) => {
    setDialogSelectedGroups(rows);
  };

  // Handler for the "Apply" button
  const handleApplySelection = () => {
    const selectedUserMembers = dialogSelectedUsers.map(u =>
      entityToSelectedMember(u, t),
    );
    const selectedGroupMembers = dialogSelectedGroups.map(g =>
      entityToSelectedMember(g, t),
    );

    // Pass the combined, formatted selection back to the parent
    onApply([...selectedUserMembers, ...selectedGroupMembers]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        Member Selection
        <IconButton
          aria-label="close"
          className={classes.dialogCloseButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_e, newValue) => setTabValue(newValue)}
            aria-label="users and groups tabs"
          >
            <Tab label={`Users (${allUsers.length})`} id="simple-tab-0" />
            <Tab label={`Groups (${allGroups.length})`} id="simple-tab-1" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          {isLoading ? (
            <Progress />
          ) : (
            <Table
              title="Select Users"
              columns={userColumns}
              data={tableUsers}
              options={{
                selection: true,
                paging: true,
                pageSize: 50,
                pageSizeOptions: [10, 20, 50, 100],
                showSelectAllCheckbox: true,
              }}
              onSelectionChange={onUserSelectionChange}
            />
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {isLoading ? (
            <Progress />
          ) : (
            <Table
              title="Select Groups"
              columns={groupColumns}
              data={tableGroups}
              options={{
                selection: true,
                paging: true,
                pageSize: 50,
                pageSizeOptions: [10, 20, 50, 100],
                showSelectAllCheckbox: true,
              }}
              onSelectionChange={onGroupSelectionChange}
            />
          )}
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleApplySelection}
          color="primary"
          variant="contained"
        >
          Apply Selection
        </Button>
      </DialogActions>
    </Dialog>
  );
};
