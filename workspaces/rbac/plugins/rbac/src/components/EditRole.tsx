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

import { parseEntityRef } from '@backstage/catalog-model';
import { Link } from '@backstage/core-components';

import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

type EditRoleProps = {
  roleName: string;
  disable: boolean;
  tooltip?: string;
  dataTestId: string;
  to?: string;
};

const EditRole = ({
  roleName,
  tooltip,
  disable,
  dataTestId,
  to,
}: EditRoleProps) => {
  const { name, namespace, kind } = parseEntityRef(roleName);
  return (
    <Tooltip title={tooltip || ''}>
      <Typography component="span" data-testid={dataTestId}>
        <IconButton
          color="inherit"
          component={Link}
          aria-label="Update"
          disabled={disable}
          title={tooltip || 'Edit Role'}
          to={to || `../role/${kind}/${namespace}/${name}`}
        >
          <EditIcon />
        </IconButton>
      </Typography>
    </Tooltip>
  );
};

export default EditRole;
