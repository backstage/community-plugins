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

import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { ConditionsForm } from './ConditionsForm';
import { ConditionsData, RulesData } from './types';

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
  return (
    <Drawer
      anchor="right"
      open={open}
      data-testid="rules-sidebar"
      PaperProps={{
        sx: {
          ['@media (max-width: 960px)']: {
            width: '100%',
          },
          width: '50%',
          height: '100%',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexFlow: 'column',
          justifyContent: 'space-between',
          height: '100%',
          backgroundColor: theme => `${theme.palette.background.paper}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            padding: theme => theme.spacing(2.5),
            fontFamily: theme => theme.typography.fontFamily,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', gap: '5px' }}>
              <Typography sx={{ fontWeight: 500 }} variant="h5">
                Configure access for the
              </Typography>
              <Typography style={{ fontWeight: 600 }} variant="h5">
                {selPluginResourceType}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 400,
                fontFamily: theme => theme.typography.fontFamily,
                paddingTop: theme => theme.spacing(1),
              }}
              align="left"
            >
              By default, the selected resource type will be visible to the
              chosen users in step two. If you want to restrict or grant
              permission to specific plugin resource type rule, select it and
              add the required parameters.
            </Typography>
          </Box>
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
