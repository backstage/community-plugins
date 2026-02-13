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
import { Project } from '../../../models';
import { Table } from '../../../components';
import { ProjectData } from '../../../queries';
import { projectTableColumnSchema } from './projectTable.schema';
import { getProjetStatistics } from './projectTable.helpers';

export const ProjectTable = ({
  projectData,
  projectDataError,
  projectDataLoading,
}: ProjectData) => (
  <Table
    clientName={projectData?.clientName}
    clientUrl={`${projectData?.clientUrl}/app/orgs/${projectData?.clientName}/projects`}
    getStatistics={data => getProjetStatistics(data as Project[])}
    tableColumns={projectTableColumnSchema}
    tableData={projectData?.projectList as Project[]}
    tableDataError={projectDataError}
    tableDataLoading={projectDataLoading}
    tableTitle="Projects"
    totalTitle="Projects Overview"
  />
);
