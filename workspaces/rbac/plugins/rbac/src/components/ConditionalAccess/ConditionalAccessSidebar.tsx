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

import { makeStyles } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { ConditionsForm } from './ConditionsForm';
import { ConditionsData, RulesData } from './types';

const useDrawerStyles = makeStyles(() => ({
  paper: {
    ['@media (max-width: 960px)']: {
      width: '-webkit-fill-available',
    },
    width: '50vw',
    height: '100vh',
    gap: '3%',
    display: '-webkit-inline-box',
  },
}));

const useDrawerContentStyles = makeStyles(theme => ({
  sidebar: {
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-between',
    backgroundColor: `${theme.palette.background.default} !important`,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: theme.spacing(2.5),
    fontFamily: theme.typography.fontFamily,
  },
  headerSubtitle: {
    fontWeight: 400,
    fontFamily: theme.typography.fontFamily,
    paddingTop: theme.spacing(1),
  },
}));

type ConditionalAccessSidebarProps = {
  open: boolean;
  onClose: () => void;
  onSave: (conditions?: ConditionsData) => void;
  selPluginResourceType: string;
  conditionRulesData?: RulesData;
  conditionsFormVal?: ConditionsData;
};

export const ConditionalAccessSidebar = ({
  open,
  onClose,
  onSave,
  selPluginResourceType,
  conditionRulesData,
  conditionsFormVal,
}: ConditionalAccessSidebarProps) => {
  const classes = useDrawerStyles();
  const contentClasses = useDrawerContentStyles();
  return (
    <Drawer
      anchor="right"
      open={open}
      data-testid="rules-sidebar"
      classes={{
        paper: classes.paper,
      }}
    >
      <Box className={contentClasses.sidebar}>
        <Box className={contentClasses.header}>
          <Typography variant="h5">
            <Typography component="span" sx={{ fontWeight: 500 }}>
              Configure access for the
            </Typography>{' '}
            {selPluginResourceType}
            <Typography
              variant="body2"
              className={contentClasses.headerSubtitle}
              align="left"
            >
              By default, the selected resource type will be visible to the
              chosen users in step two. If you want to restrict or grant
              permission to specific plugin resource type rule, select it and
              add the required parameters.
            </Typography>
          </Typography>
          <IconButton
            key="dismiss"
            title="Close the drawer"
            onClick={onClose}
            color="inherit"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <ConditionsForm
          conditionRulesData={conditionRulesData}
          selPluginResourceType={selPluginResourceType}
          conditionsFormVal={conditionsFormVal}
          onClose={onClose}
          onSave={onSave}
        />
      </Box>
    </Drawer>
  );
};
