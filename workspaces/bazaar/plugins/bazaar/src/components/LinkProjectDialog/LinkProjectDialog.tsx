/*
 * Copyright 2021 The Backstage Authors
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
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { Button } from '@backstage/ui';
import { ProjectSelector } from '../ProjectSelector';
import { CustomDialogTitle, DialogActions } from '../CustomDialogTitle';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';

import { bazaarApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';

import { BazaarProject } from '../../types';
import styles from './LinkProjectDialog.module.css';

type Props = {
  openProjectSelector: boolean;
  handleProjectSelectorClose: () => void;
  catalogEntities: Entity[];
  bazaarProject: BazaarProject;
  fetchBazaarProject: () => Promise<BazaarProject | null>;
  initEntity: Entity;
};

export const LinkProjectDialog = ({
  openProjectSelector,
  handleProjectSelectorClose,
  catalogEntities,
  bazaarProject,
  fetchBazaarProject,
  initEntity,
}: Props) => {
  const bazaarApi = useApi(bazaarApiRef);
  const alertApi = useApi(toastApiRef);
  const [selectedEntity, setSelectedEntity] = useState(initEntity);
  const [selectedEntityName, setSelectedEntityName] = useState('');
  const handleEntityClick = (entity: Entity) => {
    setSelectedEntity(entity);
    setSelectedEntityName(entity.metadata.name);
  };

  const handleSubmit = async () => {
    handleProjectSelectorClose();

    const updateResponse = await bazaarApi.updateProject({
      ...bazaarProject,
      entityRef: stringifyEntityRef(selectedEntity!),
    });
    if (updateResponse.status === 'ok') {
      fetchBazaarProject();
      alertApi.post({
        title: `linked entity '${selectedEntityName}' to the project ${bazaarProject.title}`,
        status: 'success',
      });
    }
  };

  return (
    <Dialog onClose={handleProjectSelectorClose} open={openProjectSelector}>
      <CustomDialogTitle
        id="customized-dialog-title"
        onClose={handleProjectSelectorClose}
      >
        Select entity
      </CustomDialogTitle>
      <DialogContent className={styles.content} dividers>
        <ProjectSelector
          label=""
          onChange={handleEntityClick}
          catalogEntities={catalogEntities || []}
          disableClearable
          defaultValue={catalogEntities[0] || null}
        />
      </DialogContent>

      <DialogActions>
        <Button onPress={handleSubmit} variant="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};
