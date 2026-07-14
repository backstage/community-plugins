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

import { ChangeEvent, useState } from 'react';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import { Grid } from '@backstage/ui';
import TablePagination from '@material-ui/core/TablePagination';
import { BazaarProject } from '../../types';
import { Entity } from '@backstage/catalog-model';
import styles from './ProjectPreview.module.css';

type Props = {
  bazaarProjects: BazaarProject[];
  fetchBazaarProjects: () => Promise<BazaarProject[]>;
  catalogEntities: Entity[];
  useTablePagination?: boolean;
  gridSize?: number;
  height: 'large' | 'small';
};

export const ProjectPreview = ({
  bazaarProjects,
  fetchBazaarProjects,
  catalogEntities,
  useTablePagination = true,
  gridSize = 2,
  height = 'large',
}: Props) => {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(12);

  const handlePageChange = (_: any, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleRowChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRows(parseInt(event.target.value, 10));
    setPage(1);
  };

  if (!bazaarProjects.length) {
    return (
      <div className={styles.empty}>Please add projects to the Bazaar.</div>
    );
  }

  return (
    <div className={styles.content}>
      <Grid.Root columns={{ sm: '12' }} gap="6">
        {bazaarProjects
          .slice((page - 1) * rows, rows * page)
          .map((bazaarProject: BazaarProject, i: number) => {
            return (
              <Grid.Item key={i} colSpan={{ sm: String(gridSize) as any }}>
                <ProjectCard
                  project={bazaarProject}
                  key={i}
                  fetchBazaarProjects={fetchBazaarProjects}
                  catalogEntities={catalogEntities}
                  height={height}
                />
              </Grid.Item>
            );
          })}
      </Grid.Root>

      {useTablePagination && (
        <TablePagination
          component="div"
          className={styles.pagination}
          rowsPerPageOptions={[12, 24, 48, 96]}
          count={bazaarProjects?.length}
          page={page - 1}
          onPageChange={handlePageChange}
          rowsPerPage={rows}
          onRowsPerPageChange={handleRowChange}
          backIconButtonProps={{ disabled: page === 1 }}
          nextIconButtonProps={{
            disabled: rows * page >= bazaarProjects.length,
          }}
        />
      )}
    </div>
  );
};
