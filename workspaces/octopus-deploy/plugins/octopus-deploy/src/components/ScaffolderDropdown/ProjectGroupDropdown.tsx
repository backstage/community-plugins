/*
 * Copyright 2023 The Backstage Authors
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

import { useState } from 'react';
import { Select, TextField } from '@backstage/ui';
import { useProjectGroups } from '../../hooks/useProjectGroups';
import { ScaffolderField } from '@backstage/plugin-scaffolder-react/alpha';
import { FieldExtensionComponentProps } from '@backstage/plugin-scaffolder-react';

export const ProjectGroupDropdown = ({
  onChange,
  errors,
  rawErrors,
  required,
  help,
  rawDescription,
  disabled,
}: FieldExtensionComponentProps<string>) => {
  const [selectedProjectGroup, setSelectedProjectGroup] = useState<string>('');
  const { projectGroups } = useProjectGroups();

  const projectGroupOptions = projectGroups
    ? projectGroups.map(pg => ({ id: pg.Name, label: pg.Name }))
    : [];

  const updateProjectGroup = (pg: string) => {
    setSelectedProjectGroup(pg);
    onChange(pg);
  };

  return (
    <ScaffolderField
      rawErrors={rawErrors}
      errors={errors}
      required={required}
      help={help}
      rawDescription={rawDescription}
      disabled={disabled}
    >
      {projectGroups?.length ? (
        <Select
          label="Project Group"
          selectionMode="single"
          options={projectGroupOptions}
          value={selectedProjectGroup || null}
          onChange={key => updateProjectGroup(key ? String(key) : '')}
          isDisabled={projectGroups.length === 1}
        />
      ) : (
        <TextField
          id="project-group-input"
          label="Project Group"
          value={selectedProjectGroup}
          onChange={updateProjectGroup}
        />
      )}
    </ScaffolderField>
  );
};
