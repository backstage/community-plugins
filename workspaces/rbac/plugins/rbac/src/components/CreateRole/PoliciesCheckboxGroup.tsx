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

import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';

import { PermissionsData } from '../../types';
import { RowPolicy } from './types';

export const PoliciesCheckboxGroup = ({
  permissionPoliciesRowData,
  rowName,
  onChangePolicy,
}: {
  permissionPoliciesRowData: PermissionsData;
  rowName: string;

  onChangePolicy: (isChecked: boolean, policyIndex: number) => void;
}) => {
  return (
    <FormControl
      required
      style={{
        justifyContent: 'flex-start',
        gap: '1px',
        width: '402px',
        flexGrow: '1',
        marginBottom: '25px',
      }}
    >
      <FormLabel
        style={{
          fontWeight: 800,
          fontSize: '0.8rem',
        }}
      >
        What actions they can do?
      </FormLabel>
      <FormGroup
        style={{
          display: 'flex',
          gap: '7px',
          flexDirection: 'row',
          paddingLeft: '9px',
        }}
      >
        {permissionPoliciesRowData.policies.map(
          (p: RowPolicy, index: number, self) => {
            const labelCheckedArray = self.filter(
              val => val.effect === 'allow',
            );
            const labelCheckedCount = labelCheckedArray.length;
            return (
              <FormControlLabel
                key={p.policy}
                disabled={
                  !(
                    permissionPoliciesRowData.plugin &&
                    permissionPoliciesRowData.permission
                  ) ||
                  permissionPoliciesRowData.policies.length === 1 ||
                  (labelCheckedCount === 1 &&
                    labelCheckedArray[0].policy === p.policy)
                }
                label={p.policy}
                name={`${rowName}.policies[${index}].policy`}
                control={
                  <Checkbox
                    checked={p.effect === 'allow'}
                    name={`${rowName}.policies[${index}].policy-${p.policy}`}
                    onChange={e => onChangePolicy(e.target.checked, index)}
                    color="primary"
                  />
                }
              />
            );
          },
        )}
      </FormGroup>
    </FormControl>
  );
};
