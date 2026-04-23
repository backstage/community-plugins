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
import { Content } from '@backstage/core-components';
import { useApi, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { mendApiRef } from '../../api';
import { FindingTable } from './components';
import { useFindingData } from '../../queries';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Project } from '../../models';

export const Tab = () => {
  const connectBackendApi = useApi(mendApiRef);
  const { fetch } = useApi(fetchApiRef);
  const { entity } = useEntity();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const selectedProjectFromUrl = queryParams.get('filter') || null;

  const [projectId, setProjectId] = useState<string | null>(
    selectedProjectFromUrl,
  );

  // Keep a stable reference to the project list to prevent filter from hiding during refetch
  const projectListRef = useRef<Project[] | undefined>(undefined);

  // Fetch findings for the selected project
  // If projectId is null, backend will use the first project
  // This will also return the list of all projects for this entity
  const findingData = useFindingData({
    connectApi: connectBackendApi,
    fetchApi: fetch,
    uid: entity.metadata.uid,
    projectId: projectId || undefined,
  });

  // Update the stable project list reference when data is available
  useEffect(() => {
    if (findingData.findingData?.projectList) {
      projectListRef.current = findingData.findingData.projectList;
    }
  }, [findingData.findingData?.projectList]);

  return (
    <Content>
      <FindingTable
        {...findingData}
        // Use the stable project list reference to prevent filter from disappearing during refetch
        projectList={projectListRef.current}
        selectedProjectId={projectId}
        onProjectChange={setProjectId}
      />
    </Content>
  );
};
