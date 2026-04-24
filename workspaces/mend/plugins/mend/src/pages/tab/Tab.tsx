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
import { useLocation, useNavigate } from 'react-router-dom';
import { Project } from '../../models';

export const Tab = () => {
  const connectBackendApi = useApi(mendApiRef);
  const { fetch } = useApi(fetchApiRef);
  const { entity } = useEntity();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);
  const selectedProjectFromUrl = queryParams.get('filter') || null;

  const [projectId, setProjectId] = useState<string | null>(
    selectedProjectFromUrl,
  );

  // Track if the project change is from user selection (not URL change)
  const isManualSelectionRef = useRef(false);

  // Sync projectId state with URL query parameter changes
  // Only update if it's not a manual selection
  useEffect(() => {
    if (!isManualSelectionRef.current) {
      setProjectId(selectedProjectFromUrl);
    }
    // Reset the flag after processing
    isManualSelectionRef.current = false;
  }, [selectedProjectFromUrl]);

  // Handle project change from dropdown - remove filter from URL
  const handleProjectChange = (newProjectId: string) => {
    // Set flag to prevent useEffect from overriding our selection
    isManualSelectionRef.current = true;

    setProjectId(newProjectId);

    // Remove the filter parameter from URL when user manually selects from dropdown
    const newQueryParams = new URLSearchParams(search);
    newQueryParams.delete('filter');

    const newSearch = newQueryParams.toString();
    const newUrl = newSearch ? `${pathname}?${newSearch}` : pathname;

    navigate(newUrl, { replace: true });
  };

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
        onProjectChange={handleProjectChange}
      />
    </Content>
  );
};
