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
import type { FC } from 'react';

import { useContext, createContext, ReactNode } from 'react';
import {
  Application,
  History,
  RevisionInfo,
} from '@backstage-community/plugin-redhat-argocd-common';

interface DrawerContextValue {
  application: Application;
  revisions: RevisionInfo[];
  latestRevision: History;
  appHistory: History[];
}

interface DrawerContextProps {
  application: Application;
  revisions: RevisionInfo[];
  children: ReactNode;
}

export const DrawerContext = createContext<DrawerContextValue>(
  undefined as any,
);

export const DrawerProvider: FC<DrawerContextProps> = ({
  application,
  revisions,
  children,
}) => {
  const appHistory = application?.status?.history ?? [];
  const latestRevision = appHistory[appHistory.length - 1];

  return (
    <DrawerContext.Provider
      value={{
        application,
        appHistory,
        latestRevision,
        revisions,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawerContext must be used within an DrawerProvider');
  }
  return context;
};
