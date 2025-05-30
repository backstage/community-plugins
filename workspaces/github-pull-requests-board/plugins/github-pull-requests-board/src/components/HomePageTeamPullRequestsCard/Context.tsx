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

import type { GroupEntity } from '@backstage/catalog-model';
import { useApi } from '@backstage/frontend-plugin-api';
import {
  catalogApiRef,
  CATALOG_FILTER_EXISTS,
} from '@backstage/plugin-catalog-react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type TeamPullRequestsContextValue = {
  loading: boolean;
  handleChangeType: Function;
  entity: GroupEntity | null;
  teams: GroupEntity[];
};

const TEAM_PULL_REQUEST_STORAGE_KEY = '/home/team-pull-requests-card';

const Context = createContext<TeamPullRequestsContextValue | undefined>(
  undefined,
);

export const ContextProvider = (props: { children: JSX.Element }) => {
  const { children } = props;

  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState<GroupEntity | null>(() => {
    const stored = localStorage.getItem(TEAM_PULL_REQUEST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [teams, setTeams] = useState<GroupEntity[]>([]);

  const catalogApi = useApi(catalogApiRef);

  const handleChangeType = (group: GroupEntity | null) => {
    setEntity(group);
  };

  const fetchTeams = useCallback(async () => {
    const { items: githubTeams } = await catalogApi.getEntities({
      filter: {
        kind: 'Group',
        'metadata.annotations.github.com/team-slug': CATALOG_FILTER_EXISTS,
      },
    });
    setTeams(githubTeams as GroupEntity[]);
  }, [catalogApi]);

  useEffect(() => {
    setLoading(true);
    fetchTeams();
    setLoading(false);
  }, [fetchTeams]);

  // Persist entity to localStorage whenever it changes
  useEffect(() => {
    if (entity) {
      localStorage.setItem(
        TEAM_PULL_REQUEST_STORAGE_KEY,
        JSON.stringify(entity),
      );
    } else {
      localStorage.removeItem(TEAM_PULL_REQUEST_STORAGE_KEY);
    }
  }, [entity]);

  return (
    <Context.Provider
      value={{
        handleChangeType,
        loading,
        entity,
        teams,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useTeamPullRequestsContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error(
      'useTeamPullRequestsContext must be used within a ContextProvider',
    );
  }
  return context;
};

export default ContextProvider;
