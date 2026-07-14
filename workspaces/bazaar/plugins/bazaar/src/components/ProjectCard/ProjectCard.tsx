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
import { ItemCardHeader } from '@backstage/core-components';
import Dialog from '@material-ui/core/Dialog';
import { Text } from '@backstage/ui';
import { StatusTag } from '../StatusTag/StatusTag';
import { BazaarProject } from '../../types';
import { DateTime } from 'luxon';
import { HomePageBazaarInfoCard } from '../HomePageBazaarInfoCard';
import { Entity } from '@backstage/catalog-model';
import styles from './ProjectCard.module.css';

type Props = {
  project: BazaarProject;
  fetchBazaarProjects: () => Promise<BazaarProject[]>;
  catalogEntities: Entity[];
  height: 'large' | 'small';
};

export const ProjectCard = ({
  project,
  fetchBazaarProjects,
  catalogEntities,
  height,
}: Props) => {
  const [openCard, setOpenCard] = useState(false);
  const { id, title, status, updatedAt, description, membersCount } = project;

  const handleClose = () => {
    setOpenCard(false);
    fetchBazaarProjects();
  };

  return (
    <div>
      <Dialog fullWidth onClose={handleClose} open={openCard}>
        <HomePageBazaarInfoCard
          initProject={project}
          handleClose={handleClose}
          initEntity={catalogEntities[0] || null}
        />
      </Dialog>

      <button
        type="button"
        key={id}
        className={styles.card}
        onClick={() => setOpenCard(true)}
      >
        <ItemCardHeader
          classes={{ root: styles.header }}
          title={title}
          subtitle={`updated ${DateTime.fromISO(
            new Date(updatedAt!).toISOString(),
          ).toRelative({
            base: DateTime.now(),
          })}`}
        />
        <div className={styles.cardContent}>
          <StatusTag styles={styles.statusTag} status={status} />
          <Text variant="body-small" className={styles.memberCount}>
            {Number(membersCount) === Number(1)
              ? `${membersCount} member`
              : `${membersCount} members`}
          </Text>
          <Text
            variant="body-small"
            className={`${styles.descriptionBase} ${
              height === 'large'
                ? styles.descriptionLarge
                : styles.descriptionSmall
            }`}
          >
            {description}
          </Text>
        </div>
      </button>
    </div>
  );
};
